package routes

import (
	"webpulse/controllers"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/websites", controllers.AddWebsite)
		api.GET("/websites", controllers.GetWebsites)
		api.DELETE("/websites/:id", controllers.DeleteWebsite)

		api.GET("/status", controllers.GetStatus)
		api.GET("/history", controllers.GetHistory)
	}
}
