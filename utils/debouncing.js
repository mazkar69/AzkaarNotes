
// For React applications, debouncing is a common technique used to limit the rate at which a function is executed. This is particularly useful for scenarios like search input fields where you want to avoid making an API call on every keystroke.


const timeoutRef = useRef(null);

//Main debounced function to handle input changes
const handleQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    // Set new timeout for API call
    timeoutRef.current = setTimeout(async () => {
        if (value.trim()) {
            const response = await authApi.get("/api/user", {
                params: { search: value },
            });
            console.log("Search response:", response.data);
            setUsers(response.data);
        } else {
            setUsers([]);
        }
    }, 500); // 500ms delay
};

// Cleanup on unmount
useEffect(() => {
    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
}, []);