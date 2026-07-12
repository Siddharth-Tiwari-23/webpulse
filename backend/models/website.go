package models

import "time"

type Website struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	URL         string     `json:"url"`
	Status      string     `json:"status"`       // "UP", "DOWN", "UNKNOWN"
	StatusCode  *int       `json:"status_code"`
	ResponseMs  *int       `json:"response_ms"`
	LastChecked *time.Time `json:"last_checked"`
	CreatedAt   time.Time  `json:"created_at"`
}

type HealthLog struct {
	ID         int       `json:"id"`
	WebsiteID  int       `json:"website_id"`
	Status     string    `json:"status"`
	StatusCode *int      `json:"status_code"`
	ResponseMs *int      `json:"response_ms"`
	CheckedAt  time.Time `json:"checked_at"`
}

type AddWebsiteRequest struct {
	Name string `json:"name" binding:"required"`
	URL  string `json:"url"  binding:"required,url"`
}

type DashboardStats struct {
	Total   int `json:"total"`
	Online  int `json:"online"`
	Offline int `json:"offline"`
	Unknown int `json:"unknown"`
}
