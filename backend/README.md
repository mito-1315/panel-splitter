# Panel Splitter Backend

This is the backend server for the Panel Splitter application. It provides an API endpoint for file uploads.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### POST /upload

Uploads a CSV file to the server.

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data with a file field named 'file'

#### Success Response

- **Code**: 200
- **Content**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "file": {
      "filename": "1620000000000-example.csv",
      "originalname": "example.csv",
      "path": "path/to/file",
      "size": 1234
    }
  }
  ```

#### Error Responses

- **Code**: 400 BAD REQUEST
  ```json
  {
    "success": false,
    "message": "No file uploaded"
  }
  ```

- **Code**: 500 INTERNAL SERVER ERROR
  ```json
  {
    "success": false,
    "message": "Error uploading file",
    "error": "Error message"
  }
  ```

## Notes

- The server runs on port 5000 by default
- Only CSV files are accepted
- Uploaded files are stored in the `uploads` directory