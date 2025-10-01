const API_BASE_URL = "http://localhost:5000"; 

export async function pingBackend() {
    try {
        const res = await fetch(`${API_BASE_URL}/`);
        const data = await res.text();
        return data;
    } catch (error) {
        console.error("Error pinging backend:", error);
        throw new Error("Failed to connect to backend");
    }
}
