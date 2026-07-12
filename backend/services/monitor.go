package services

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"
	"webpulse/database"
)

type MonitorService struct {
	interval time.Duration
	client   *http.Client
}

func NewMonitorService(intervalSeconds string) *MonitorService {
	secs, err := strconv.Atoi(intervalSeconds)
	if err != nil || secs < 5 {
		secs = 30
	}

	return &MonitorService{
		interval: time.Duration(secs) * time.Second,
		client: &http.Client{
			Timeout: 10 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 5 {
					return http.ErrUseLastResponse
				}
				return nil
			},
		},
	}
}

// Start launches the background monitoring loop.
func (m *MonitorService) Start() {
	log.Printf("🔍 Monitor started — checking every %v", m.interval)
	go func() {
		// First check immediately on startup
		m.checkAll()

		ticker := time.NewTicker(m.interval)
		defer ticker.Stop()
		for range ticker.C {
			m.checkAll()
		}
	}()
}

func (m *MonitorService) checkAll() {
	rows, err := database.DB.Query(`SELECT id, url FROM websites`)
	if err != nil {
		log.Printf("Monitor: failed to query websites: %v", err)
		return
	}
	defer rows.Close()

	type site struct {
		id  int
		url string
	}

	var sites []site
	for rows.Next() {
		var s site
		if err := rows.Scan(&s.id, &s.url); err == nil {
			sites = append(sites, s)
		}
	}

	for _, s := range sites {
		go m.checkOne(s.id, s.url)
	}
}

func (m *MonitorService) checkOne(id int, url string) {
	start := time.Now()
	resp, err := m.client.Get(url)

	responseMs := int(time.Since(start).Milliseconds())
	status := "DOWN"
	var statusCode *int

	if err == nil {
		defer resp.Body.Close()
		code := resp.StatusCode
		statusCode = &code
		if resp.StatusCode < 400 {
			status = "UP"
		}
	}

	// Update websites table
	_, dbErr := database.DB.Exec(`
		UPDATE websites
		SET status = $1, status_code = $2, response_ms = $3, last_checked = $4
		WHERE id = $5`,
		status, statusCode, responseMs, time.Now(), id,
	)
	if dbErr != nil {
		log.Printf("Monitor: failed to update website %d: %v", id, dbErr)
	}

	// Append to health_logs
	_, logErr := database.DB.Exec(`
		INSERT INTO health_logs (website_id, status, status_code, response_ms)
		VALUES ($1, $2, $3, $4)`,
		id, status, statusCode, responseMs,
	)
	if logErr != nil {
		log.Printf("Monitor: failed to insert log for website %d: %v", id, logErr)
	}

	_ = sql.ErrNoRows // suppress unused import
}
