let accessToken: string | null = null;
let expiry: number = 0;




async function getAccessToken():Promise<string | null> {
    const response = await fetch('');
    if (!response.ok) {
        throw new Error(`${response.status}`)
    }
    const grabbedToken:
    

    return grabbedToken;
}