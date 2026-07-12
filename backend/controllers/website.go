package controllers

import (
	"net/http"
	"strconv"
	"webpulse/database"
	"webpulse/models"

	"github.com/gin-gonic/gin"
)

// POST /websites
func AddWebsite(c *gin.Context) {
	var req models.AddWebsiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var website models.Website
	err := database.DB.QueryRow(
		`INSERT INTO websites (name, url) VALUES ($1, $2)
		 RETURNING id, name, url, status, status_code, response_ms, last_checked, created_at`,
		req.Name, req.URL,
	).Scan(
		&website.ID, &website.Name, &website.URL, &website.Status,
		&website.StatusCode, &website.ResponseMs, &website.LastChecked, &website.CreatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add website: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, website)
}

// GET /websites
func GetWebsites(c *gin.Context) {
	rows, err := database.DB.Query(
		`SELECT id, name, url, status, status_code, response_ms, last_checked, created_at
		 FROM websites ORDER BY created_at DESC`,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch websites"})
		return
	}
	defer rows.Close()

	websites := []models.Website{}
	for rows.Next() {
		var w models.Website
		if err := rows.Scan(
			&w.ID, &w.Name, &w.URL, &w.Status,
			&w.StatusCode, &w.ResponseMs, &w.LastChecked, &w.CreatedAt,
		); err != nil {
			continue
		}
		websites = append(websites, w)
	}

	c.JSON(http.StatusOK, websites)
}

// DELETE /websites/:id
func DeleteWebsite(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	res, err := database.DB.Exec(`DELETE FROM websites WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete website"})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Website deleted"})
}

// GET /status  – dashboard summary counts
func GetStatus(c *gin.Context) {
	var stats models.DashboardStats
	err := database.DB.QueryRow(`
		SELECT
			COUNT(*) AS total,
			COUNT(*) FILTER (WHERE status = 'UP')      AS online,
			COUNT(*) FILTER (WHERE status = 'DOWN')    AS offline,
			COUNT(*) FILTER (WHERE status = 'UNKNOWN') AS unknown
		FROM websites
	`).Scan(&stats.Total, &stats.Online, &stats.Offline, &stats.Unknown)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch status"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GET /history?website_id=1&limit=50
func GetHistory(c *gin.Context) {
	websiteID := c.Query("website_id")
	limit := c.DefaultQuery("limit", "50")

	if websiteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "website_id query param is required"})
		return
	}

	rows, err := database.DB.Query(`
		SELECT id, website_id, status, status_code, response_ms, checked_at
		FROM health_logs
		WHERE website_id = $1
		ORDER BY checked_at DESC
		LIMIT $2`,
		websiteID, limit,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}
	defer rows.Close()

	logs := []models.HealthLog{}
	for rows.Next() {
		var l models.HealthLog
		if err := rows.Scan(&l.ID, &l.WebsiteID, &l.Status, &l.StatusCode, &l.ResponseMs, &l.CheckedAt); err != nil {
			continue
		}
		logs = append(logs, l)
	}

	c.JSON(http.StatusOK, logs)
}
