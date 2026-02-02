# PaySure Website

This is the official website for PaySure - Mobile Salary Savings Platform.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **PaySure Theme**: Uses the app's signature green color scheme (#2E7D32, #4CAF50)
- **APK Download**: Direct download link for the Android app
- **Modern UI**: Clean, professional design with smooth animations

## Files

- `index.html` - Main website page
- `style.css` - Stylesheet with PaySure branding
- `paysure-v1.0.0.apk` - Android app download file
- `serve.py` - Local development server

## Running the Website

### Option 1: Python Server (Recommended)
```bash
python3 serve.py
```
Then visit: http://localhost:8080

### Option 2: Simple HTTP Server
```bash
python3 -m http.server 8080
```
Then visit: http://localhost:8080

### Option 3: Open Directly
Simply open `index.html` in your web browser.

## Website Sections

1. **Hero Section**: Main introduction with call-to-action
2. **Features**: Key benefits of using PaySure
3. **How It Works**: Step-by-step user journey
4. **Download**: APK download with version info
5. **Footer**: Additional links and information

## APK Download

The website includes a direct download button for the PaySure Android app. The APK file (`paysure-v1.0.0.apk`) is included in this directory and will be downloaded when users click the download button.

## Customization

The website uses PaySure's brand colors:
- Primary Green: #2E7D32
- Secondary Green: #4CAF50
- Background: #f8f9fa
- Text: #333

To modify colors, edit the CSS variables in `style.css`.

## Deployment

To deploy this website:

1. Upload all files to your web server
2. Ensure the APK file is accessible for download
3. Update any absolute paths if needed
4. Configure proper MIME types for APK downloads

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+
