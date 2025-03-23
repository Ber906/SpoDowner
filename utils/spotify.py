"""
Spotify API integration for SpoDown
"""
import base64
import json
import requests
import time
import logging
import os

# Set Spotify API credentials
CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "")

logger = logging.getLogger(__name__)

class SpotifyAPI:
    """Handles Spotify API requests and authentication"""
    
    def __init__(self):
        self.client_id = CLIENT_ID
        self.client_secret = CLIENT_SECRET
        self.base_url = "https://api.spotify.com/v1"
        self.token = None
        self.token_expiry = 0
        logger.info("Spotify API initialized")
        
    def _get_token(self):
        """Get a new token or use cached token if still valid"""
        current_time = time.time()
        
        # Return existing token if it's still valid
        if self.token and current_time < self.token_expiry:
            logger.info("Using existing valid Spotify token")
            return self.token
            
        # Otherwise, request a new token
        auth_url = "https://accounts.spotify.com/api/token"
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('utf-8')
        auth_header = base64.b64encode(auth_bytes).decode('utf-8')
        
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        
        payload = "grant_type=client_credentials"
        
        logger.info(f"Requesting new Spotify token with client_id: {self.client_id[:5]}...")
        
        try:
            response = requests.post(auth_url, headers=headers, data=payload)
            
            # Print more debug info
            logger.info(f"Auth response code: {response.status_code}")
            logger.info(f"Auth response text: {response.text[:200]}") # Only log first 200 chars for safety
            
            response.raise_for_status()
            
            token_data = response.json()
            self.token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)  # Default to 1 hour
            self.token_expiry = current_time + expires_in - 60  # Buffer of 60 seconds
            
            logger.info(f"New Spotify access token obtained, expires in {expires_in} seconds")
            return self.token
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error getting Spotify token: {str(e)}")
            if hasattr(e, 'response'):
                logger.error(f"Error status code: {e.response.status_code}")
                logger.error(f"Error response: {e.response.text[:200]}")
            return None
        except Exception as e:
            logger.error(f"Failed to get Spotify access token: {str(e)}")
            # Add more debug info
            if hasattr(e, '__dict__') and 'response' in e.__dict__:
                response_obj = e.__dict__['response']
                if hasattr(response_obj, 'text'):
                    logger.error(f"Error response: {response_obj.text[:200]}")
            return None
    
    def search_tracks(self, query, limit=10):
        """
        Search for tracks on Spotify
        
        Args:
            query: Search query string
            limit: Maximum number of results (default: 10)
            
        Returns:
            List of track objects or None if error
        """
        token = self._get_token()
        if not token:
            return None
            
        url = f"{self.base_url}/search"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        params = {
            "q": query,
            "type": "track",
            "limit": limit
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            json_result = response.json()
            tracks = json_result.get("tracks", {}).get("items", [])
            
            # Format the tracks to include only the data we need
            formatted_tracks = []
            for track in tracks:
                artists = ", ".join([artist["name"] for artist in track["artists"]])
                
                # Get the best quality image
                images = []
                if track["album"]["images"]:
                    images = sorted(track["album"]["images"], key=lambda x: x["width"] or 0, reverse=True)
                
                image_url = images[0]["url"] if images else ""
                
                formatted_track = {
                    "id": track["id"],
                    "name": track["name"],
                    "artists": artists,
                    "album": track["album"]["name"],
                    "image_url": image_url,
                    "preview_url": track["preview_url"],
                    "spotify_url": track["external_urls"]["spotify"],
                    "duration_ms": track["duration_ms"]
                }
                formatted_tracks.append(formatted_track)
                
            return formatted_tracks
        except Exception as e:
            logger.error(f"Error searching Spotify tracks: {str(e)}")
            return None
    
    def get_track(self, track_id):
        """
        Get details for a specific track by ID
        
        Args:
            track_id: Spotify track ID
            
        Returns:
            Track object or None if error
        """
        token = self._get_token()
        if not token:
            return None
            
        url = f"{self.base_url}/tracks/{track_id}"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            track = response.json()
            
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            
            # Get the best quality image
            images = []
            if track["album"]["images"]:
                images = sorted(track["album"]["images"], key=lambda x: x["width"] or 0, reverse=True)
            
            image_url = images[0]["url"] if images else ""
            
            formatted_track = {
                "id": track["id"],
                "name": track["name"],
                "artists": artists,
                "album": track["album"]["name"],
                "image_url": image_url,
                "preview_url": track["preview_url"],
                "spotify_url": track["external_urls"]["spotify"],
                "duration_ms": track["duration_ms"]
            }
                
            return formatted_track
        except Exception as e:
            logger.error(f"Error getting Spotify track: {str(e)}")
            return None

# Create a singleton instance for use across the application
spotify_api = SpotifyAPI()