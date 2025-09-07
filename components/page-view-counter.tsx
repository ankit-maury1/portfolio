"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

function PageViewCounter() {
  const pathname = usePathname()
  const [viewCount, setViewCount] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    const fetchViewCount = async () => {
      setIsLoading(true)
      try {
        // Only fetch the current count for this page without incrementing
        const response = await fetch(`/api/page-views?path=${encodeURIComponent(pathname)}`)
        if (response.ok) {
          const data = await response.json()
          setViewCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching view count:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Track the view only once when the component first mounts
    const trackPageView = async () => {
      try {
        await fetch('/api/page-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname })
        })
      } catch (err) {
        console.error("Error posting page view:", err)
      }
    }
    
    // Track the view once on mount
    trackPageView()
    
    // Then fetch the current count
    fetchViewCount()
    
    // Setup an interval to refresh the view count every minute
    const intervalId = setInterval(fetchViewCount, 60000)
    
    return () => clearInterval(intervalId)
  }, [pathname])
  
  if (isLoading || viewCount === null) {
    return null
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1 bg-black/30 backdrop-blur-sm",
        viewCount > 100 ? "border-cyan-500/50" : 
        viewCount > 50 ? "border-blue-500/50" : "border-gray-500/50"
      )}
    >
      <Eye className="h-3 w-3 opacity-70" />
      <span className="text-xs">{viewCount.toLocaleString()}</span>
    </Badge>
  )
}

// Export the component as default
export default PageViewCounter;
export { PageViewCounter };
