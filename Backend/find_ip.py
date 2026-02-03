import socket

def get_local_ip():
    """Get the local IP address of this computer"""
    try:
        # Create a temporary socket to get the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Connect to Google DNS
        ip_address = s.getsockname()[0]
        s.close()
        return ip_address
    except Exception as e:
        return "Unable to determine IP address"

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"Your computer's local IP address is: {ip}")
    print("\nPlease update the 'serverIP' constant in your Arduino code with this address:")
    print(f"const char* serverIP = \"{ip}\"; // Change this to your computer's IP address")