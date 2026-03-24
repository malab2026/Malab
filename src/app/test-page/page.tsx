'use client'

import { useEffect, useState } from "react"

export default function TestPage() {
    const [status, setStatus] = useState("loading")
    
    useEffect(() => {
        setStatus("loaded")
    }, [])
    
    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center", 
            minHeight: "100vh",
            padding: "20px",
            fontFamily: "system-ui, sans-serif"
        }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                ✅ Test Page Works!
            </h1>
            <p>Status: {status}</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    )
}
