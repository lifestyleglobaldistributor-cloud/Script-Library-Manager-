# Script Library Manager - Aveva System Platform

A **Progressive Web Application (PWA)** designed specifically for Aveva System Platform developers to store, organize, and manage reusable QuickScript and VBScript code snippets.

## 🚀 Features

### Core Functionality
- ✅ **Script Storage**: Local browser storage using IndexedDB for offline capability
- ✅ **Categorization**: Organize scripts by:
  - PLC Communications
  - Calculations
  - Alarm Handling
  - Data Manipulation
- ✅ **Search & Filter**: Quick search across script names, descriptions, code, and tags
- ✅ **Syntax Highlighting**: Code editor with monospace font for better readability
- ✅ **Parameter System**: Use `{{PARAMETER_NAME}}` placeholders for customizable values
- ✅ **Export Formats**: Export individual scripts as `.txt` or `.script` files

### Advanced Features
- 🔄 **Import/Export Library**: Backup entire script library as JSON
- 🏷️ **Tagging System**: Add custom tags for better organization
- 📊 **Quick Stats**: Track total scripts and last modified date
- 🌓 **Dark/Light Theme**: Toggle between themes with persistent preference
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔌 **Offline Support**: Full functionality without internet connection
- 📋 **Copy to Clipboard**: Quick copy of script code

## 📦 Installation

### Option 1: Open Directly in Browser
1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari)
2. The app will work immediately - no server required!

### Option 2: Install as PWA
1. Open the app in Chrome, Edge, or Safari
2. Look for "Install" button in address bar
3. Click to install as standalone application
4. Access from your desktop or app menu

### Option 3: Local Web Server (Recommended for full PWA features)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```
Then visit `http://localhost:8000`

## 🎯 Quick Start Guide

### Adding Your First Script

1. Click **"Add New Script"** button
2. Fill in the form:
   - **Script Name**: Descriptive name (e.g., "Read PLC Tag Value")
   - **Category**: Select appropriate category
   - **Description**: Brief explanation of what the script does
   - **Tags**: Comma-separated keywords (e.g., "read, tag, error-handling")
   - **Script Code**: Your QuickScript/VBScript code
   - **Usage Notes**: Additional instructions or prerequisites
3. Click **"Save Script"**

### Using Parameter Placeholders

Use `{{PARAMETER_NAME}}` in your code for values that need customization:

```vbscript
' Example with parameters
Dim tagValue
tagValue = ReadValue({{TagName}})
{{ResultTag}} = tagValue
```

When using the script, replace:
- `{{TagName}}` with actual tag name (e.g., `"Reactor1.Temperature"`)
- `{{ResultTag}}` with destination tag (e.g., `"Display_Temp"`)

### Searching Scripts

- Use the **search box** to find scripts by:
  - Script name
  - Description
  - Code content
  - Tags
  - Category

### Exporting Scripts

**Single Script:**
1. Click on any script card to view details
2. Click **"Export .txt"** or **"Export .script"**
3. File will download with proper header comments

**Entire Library:**
1. Click **Export Library** icon in header
2. JSON file downloads with all scripts
3. Use for backup or sharing with team

## 📚 Pre-loaded Script Templates

The app comes with 8 ready-to-use script templates:

### PLC Communications
1. **Read PLC Tag Value**: Read tag with error handling
2. **Write Value to PLC with Confirmation**: Write with retry logic

### Calculations
3. **Calculate Average with Range Check**: Average with validation

### Alarm Handling
4. **Acknowledge All Active Alarms**: Batch acknowledge alarms
5. **Alarm Priority Filter and Count**: Count by priority levels

### Data Manipulation
6. **Array Data Sort and Filter**: Sort and remove outliers
7. **String Data Parser**: Parse delimited strings
8. **Timestamp Formatter**: Format timestamps in multiple formats

## 🔧 Usage Examples

### Example 1: Reading a PLC Tag

```vbscript
' From template: "Read PLC Tag Value"
' Replace parameters:
{{TagName}} → "Line1.Motor1.Speed"
{{ResultTag}} → "HMI_MotorSpeed"
```

### Example 2: Alarm Handling

```vbscript
' From template: "Alarm Priority Filter and Count"
' Replace parameters:
{{CriticalCountTag}} → "AlarmCount_Critical"
{{HighCountTag}} → "AlarmCount_High"
{{MediumCountTag}} → "AlarmCount_Medium"
{{LowCountTag}} → "AlarmCount_Low"
```

### Example 3: String Parsing

```vbscript
' From template: "String Data Parser"
' Replace parameters:
{{InputStringTag}} → "Barcode_Data"
{{Delimiter}} → "|"
{{Part1Tag}} → "Product_ID"
{{Part2Tag}} → "Batch_Number"
```

## 🎨 UI Features

### Theme Toggle
- Click **moon icon** in header to switch between light and dark themes
- Preference is saved automatically

### Category Filters
- Click any category in sidebar to filter scripts
- Shows count for each category
- "All Scripts" shows everything

### Sorting Options
- **By Name**: Alphabetical order
- **By Date**: Most recently modified first
- **By Category**: Grouped by category

### Script Cards
- Click any card to view full details
- Shows preview of first line of code
- Displays first 3 tags
- Shows relative date (e.g., "2 days ago")

## 💾 Data Storage

### IndexedDB
- All data stored locally in browser
- Survives browser restarts
- No server connection required
- Private to your browser profile

### Export/Import
- **Export**: Creates JSON backup of entire library
- **Import**: Adds scripts from JSON file (merges with existing)
- **Format**: Human-readable JSON structure

### Data Structure
```json
{
  "version": "1.0",
  "exportDate": "2025-11-19T23:10:00.000Z",
  "scriptCount": 15,
  "scripts": [
    {
      "name": "Script Name",
      "category": "Category",
      "description": "Description",
      "tags": ["tag1", "tag2"],
      "code": "' Script code here",
      "notes": "Usage notes",
      "createdAt": "2025-11-19T23:10:00.000Z",
      "modifiedAt": "2025-11-19T23:10:00.000Z",
      "version": 1
    }
  ]
}
```

## 🛠️ Best Practices

### Naming Conventions
- Use descriptive names: ✅ "Read Multiple Tags with Timeout"
- Avoid generic names: ❌ "Script1"

### Code Comments
- Always include header comments
- Explain parameter purposes
- Document assumptions and prerequisites

### Parameter Naming
- Use PascalCase: `{{TagName}}`, `{{RetryCount}}`
- Be specific: `{{TemperatureTag}}` vs `{{Tag1}}`
- Include type hints in notes: "{{Timeout}} (Integer, milliseconds)"

### Tags
- Use lowercase
- Keep them short and relevant
- Common tags: `read`, `write`, `error-handling`, `plc`, `alarm`, `calculation`

### Version Control
- Export library regularly as backup
- Use descriptive filenames: `script-library-2025-11-19.json`
- Keep version history for critical scripts

## 🔒 Security & Privacy

- ✅ All data stored locally in your browser
- ✅ No external connections or tracking
- ✅ No user authentication required
- ✅ Works completely offline
- ✅ Data never leaves your device
- ⚠️ Clear browser data will delete scripts (always export backups!)

## 🌐 Browser Compatibility

### Fully Supported
- ✅ Google Chrome 90+
- ✅ Microsoft Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Features by Browser
| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| PWA Install | ✅ | ✅ | ❌ | ✅ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

## 📱 Mobile Usage

### Android (Chrome/Edge)
1. Open app in browser
2. Menu → "Install app" or "Add to Home Screen"
3. App appears as standalone icon
4. Full offline functionality

### iOS (Safari)
1. Open app in Safari
2. Share button → "Add to Home Screen"
3. Icon appears on home screen
4. Runs in fullscreen mode

## 🚀 Advanced Tips

### Keyboard Shortcuts
- `Ctrl/Cmd + F`: Focus search box
- `Esc`: Close modals
- `Tab`: Navigate form fields

### Bulk Operations
- Use Import/Export for team sharing
- Create template library for new projects
- Maintain separate libraries per project

### Integration with System Platform
1. Open script in Script Library Manager
2. Copy code using "Copy" button
3. Paste into System Platform IDE:
   - Galaxy IDE: QuickScript editor
   - WindowMaker: QuickScript window
   - Application Server: Script Manager

### Custom Categories
To add custom categories, modify the source code:
- Edit `index.html`: Add category buttons
- Edit `app.js`: Add to category arrays
- Edit `styles.css`: Optional styling

## 🐛 Troubleshooting

### Scripts Not Saving
- **Issue**: Scripts disappear after browser restart
- **Solution**: Check if cookies/storage is enabled in browser settings

### Export Not Working
- **Issue**: Download doesn't start
- **Solution**: Check browser download permissions

### PWA Won't Install
- **Issue**: No install prompt appears
- **Solution**: Ensure HTTPS or localhost, clear cache and reload

### Search Not Working
- **Issue**: Search returns no results
- **Solution**: Check spelling, try fewer keywords

### Dark Theme Not Persisting
- **Issue**: Always opens in light theme
- **Solution**: Enable localStorage in browser settings

## 📄 File Structure

```
script-library-manager/
├── index.html          # Main HTML structure
├── styles.css          # All styles (light/dark themes)
├── app.js              # Application logic and UI
├── db.js               # IndexedDB database management
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
└── README.md           # This file
```

## 🔄 Version History

### Version 1.0 (Current)
- ✅ Initial release
- ✅ Core CRUD operations
- ✅ 4 default categories
- ✅ 8 pre-loaded templates
- ✅ Import/Export functionality
- ✅ Dark/Light themes
- ✅ Offline PWA support
- ✅ Search and filter
- ✅ Parameter system

## 🎓 For Aveva System Platform Developers

### Common Use Cases

**1. PLC Communication Templates**
- Tag read/write with error handling
- Batch operations
- Connection retry logic
- Timeout management

**2. Alarm Management**
- Custom alarm filters
- Acknowledgment scripts
- Priority-based handling
- Alarm analytics

**3. Data Processing**
- Array operations
- String parsing (barcodes, protocols)
- Mathematical calculations
- Statistical functions

**4. System Integration**
- Recipe management
- Batch reporting
- Data logging
- Event handling

### Integration Notes

**QuickScript Compatibility:**
- All templates use standard VBScript syntax
- Compatible with InTouch QuickScript
- Works with Application Server scripts
- No external dependencies

**Naming Conflicts:**
- Use unique parameter names
- Check for reserved keywords
- Test in development environment first

**Performance:**
- Optimize loops for large datasets
- Use appropriate delays for PLC timing
- Consider scan time impacts
- Test under production load

## 🤝 Support & Contribution

### Getting Help
- Review pre-loaded examples
- Check parameter syntax
- Verify category selection
- Export and inspect JSON for debugging

### Best Practices for Sharing
- Remove sensitive information (IPs, passwords)
- Test scripts before sharing
- Document parameter requirements
- Include usage examples

## 📜 License

This is a free, open-source tool for Aveva System Platform developers. Use, modify, and share as needed.

## ⚡ Quick Reference

### Parameter Syntax
```vbscript
{{ParameterName}}        ✅ Correct
$ParameterName$          ❌ Wrong
{ParameterName}          ❌ Wrong
[ParameterName]          ❌ Wrong
```

### File Extensions
- `.txt` - Plain text export
- `.script` - Script file export (same format as .txt)
- `.json` - Library backup format

### Keyboard Navigation
- Search box → Type to search
- Category buttons → Filter by category
- Script cards → Click to view
- Modal backdrop → Click to close

---

**Made for Aveva System Platform Developers** | PWA Technology | Offline-First Design
