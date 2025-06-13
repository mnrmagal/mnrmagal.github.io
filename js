async function getServerIP() {
  try {
    const res = await fetch('/ip');
    if (!res.ok) throw new Error(res.status);
    const { ip } = await res.json();
    console.log(ip);
    return ip;
  } catch {
    return null;
  }
}
getServerIP();

