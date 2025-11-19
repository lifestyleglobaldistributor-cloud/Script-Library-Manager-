// Database Management with IndexedDB
class ScriptDatabase {
    constructor() {
        this.dbName = 'ScriptLibraryDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create scripts store
                if (!db.objectStoreNames.contains('scripts')) {
                    const scriptStore = db.createObjectStore('scripts', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Create indexes
                    scriptStore.createIndex('name', 'name', { unique: false });
                    scriptStore.createIndex('category', 'category', { unique: false });
                    scriptStore.createIndex('createdAt', 'createdAt', { unique: false });
                    scriptStore.createIndex('modifiedAt', 'modifiedAt', { unique: false });
                }
            };
        });
    }

    async addScript(script) {
        const transaction = this.db.transaction(['scripts'], 'readwrite');
        const store = transaction.objectStore('scripts');
        
        script.createdAt = new Date().toISOString();
        script.modifiedAt = new Date().toISOString();
        script.version = 1;
        
        return new Promise((resolve, reject) => {
            const request = store.add(script);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateScript(id, script) {
        const transaction = this.db.transaction(['scripts'], 'readwrite');
        const store = transaction.objectStore('scripts');
        
        const existing = await this.getScript(id);
        script.id = id;
        script.createdAt = existing.createdAt;
        script.modifiedAt = new Date().toISOString();
        script.version = (existing.version || 1) + 1;
        
        return new Promise((resolve, reject) => {
            const request = store.put(script);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteScript(id) {
        const transaction = this.db.transaction(['scripts'], 'readwrite');
        const store = transaction.objectStore('scripts');
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getScript(id) {
        const transaction = this.db.transaction(['scripts'], 'readonly');
        const store = transaction.objectStore('scripts');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllScripts() {
        const transaction = this.db.transaction(['scripts'], 'readonly');
        const store = transaction.objectStore('scripts');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getScriptsByCategory(category) {
        const transaction = this.db.transaction(['scripts'], 'readonly');
        const store = transaction.objectStore('scripts');
        const index = store.index('category');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(category);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async searchScripts(query) {
        const allScripts = await this.getAllScripts();
        const lowerQuery = query.toLowerCase();
        
        return allScripts.filter(script => {
            return (
                script.name.toLowerCase().includes(lowerQuery) ||
                script.description?.toLowerCase().includes(lowerQuery) ||
                script.code.toLowerCase().includes(lowerQuery) ||
                script.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                script.category.toLowerCase().includes(lowerQuery)
            );
        });
    }

    async exportLibrary() {
        const scripts = await this.getAllScripts();
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            scriptCount: scripts.length,
            scripts: scripts
        };
    }

    async importLibrary(data) {
        if (!data.scripts || !Array.isArray(data.scripts)) {
            throw new Error('Invalid library format');
        }

        const transaction = this.db.transaction(['scripts'], 'readwrite');
        const store = transaction.objectStore('scripts');

        const promises = data.scripts.map(script => {
            // Remove id to allow auto-increment
            const { id, ...scriptData } = script;
            return new Promise((resolve, reject) => {
                const request = store.add(scriptData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    async clearAllScripts() {
        const transaction = this.db.transaction(['scripts'], 'readwrite');
        const store = transaction.objectStore('scripts');
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async initializeDefaultScripts() {
        const count = await this.getScriptCount();
        if (count > 0) return; // Don't add defaults if scripts exist

        const defaultScripts = [
            {
                name: 'Read PLC Tag Value',
                category: 'PLC Communications',
                description: 'Reads a value from a PLC tag with error handling',
                tags: ['read', 'plc', 'tag', 'error-handling'],
                code: `' Read PLC Tag Value with Error Handling
Dim tagValue
Dim tagName

' Set the tag name to read
tagName = "{{TagName}}"

' Check if tag exists
If InTouchTag(tagName) Then
    ' Read the tag value
    tagValue = ReadValue(tagName)
    
    ' Log the value
    LogMessage "Tag " & tagName & " = " & CStr(tagValue)
    
    ' Store result
    {{ResultTag}} = tagValue
Else
    LogMessage "Error: Tag " & tagName & " does not exist"
    {{ResultTag}} = 0
End If`,
                notes: 'Replace {{TagName}} with your actual tag name and {{ResultTag}} with the destination tag.'
            },
            {
                name: 'Write Value to PLC with Confirmation',
                category: 'PLC Communications',
                description: 'Writes a value to PLC tag and confirms the write operation',
                tags: ['write', 'plc', 'confirmation'],
                code: `' Write Value to PLC with Confirmation
Dim targetTag, writeValue, readbackValue
Dim maxRetries, retryCount

targetTag = "{{TagName}}"
writeValue = {{WriteValue}}
maxRetries = 3
retryCount = 0

' Attempt to write value
While retryCount < maxRetries
    ' Write the value
    WriteValue targetTag, writeValue
    
    ' Wait for PLC update
    Delay 100
    
    ' Read back to confirm
    readbackValue = ReadValue(targetTag)
    
    If readbackValue = writeValue Then
        LogMessage "Successfully wrote " & CStr(writeValue) & " to " & targetTag
        {{SuccessFlag}} = 1
        Exit Sub
    End If
    
    retryCount = retryCount + 1
    Delay 200
Wend

' Write failed after retries
LogMessage "Failed to write to " & targetTag & " after " & CStr(maxRetries) & " attempts"
{{SuccessFlag}} = 0`,
                notes: 'Use for critical writes that require confirmation. Adjust delay times based on PLC scan time.'
            },
            {
                name: 'Calculate Average with Range Check',
                category: 'Calculations',
                description: 'Calculates average of multiple values with range validation',
                tags: ['average', 'calculation', 'validation'],
                code: `' Calculate Average with Range Check
Dim values({{ArraySize}})
Dim sum, avg, count, i
Dim minValue, maxValue

' Define valid range
minValue = {{MinValue}}
maxValue = {{MaxValue}}

' Read values from tags
values(0) = {{Tag1}}
values(1) = {{Tag2}}
values(2) = {{Tag3}}
' Add more values as needed

sum = 0
count = 0

' Calculate sum of valid values
For i = 0 To UBound(values)
    If values(i) >= minValue And values(i) <= maxValue Then
        sum = sum + values(i)
        count = count + 1
    Else
        LogMessage "Value " & CStr(values(i)) & " is out of range"
    End If
Next

' Calculate average
If count > 0 Then
    avg = sum / count
    {{AverageTag}} = avg
    LogMessage "Average: " & CStr(avg) & " from " & CStr(count) & " valid values"
Else
    {{AverageTag}} = 0
    LogMessage "No valid values for average calculation"
End If`,
                notes: 'Replace array size and tag references. Adjust min/max values for your process range.'
            },
            {
                name: 'Acknowledge All Active Alarms',
                category: 'Alarm Handling',
                description: 'Acknowledges all active alarms for a specific area or group',
                tags: ['alarm', 'acknowledge', 'batch'],
                code: `' Acknowledge All Active Alarms in Area
Dim alarmGroup, alarmCount, i
Dim result

' Define alarm group/area
alarmGroup = "{{AlarmArea}}"

' Get alarm count
alarmCount = wwAlarmTotalRecords()

If alarmCount > 0 Then
    LogMessage "Acknowledging " & CStr(alarmCount) & " alarms in " & alarmGroup
    
    ' Acknowledge all alarms
    result = wwAcknowledgeAllAlarms()
    
    If result = 0 Then
        LogMessage "Successfully acknowledged all alarms"
        {{AckStatusTag}} = 1
    Else
        LogMessage "Error acknowledging alarms: " & CStr(result)
        {{AckStatusTag}} = 0
    End If
Else
    LogMessage "No active alarms to acknowledge"
    {{AckStatusTag}} = 1
End If`,
                notes: 'Use wwAlarmFilterSelectGroup() before this script to filter by specific alarm group.'
            },
            {
                name: 'Alarm Priority Filter and Count',
                category: 'Alarm Handling',
                description: 'Filters alarms by priority and counts them by severity',
                tags: ['alarm', 'filter', 'priority', 'count'],
                code: `' Count Alarms by Priority Level
Dim criticalCount, highCount, mediumCount, lowCount
Dim totalCount

' Initialize counters
criticalCount = 0
highCount = 0
mediumCount = 0
lowCount = 0

' Get total alarm count
totalCount = wwAlarmTotalRecords()

If totalCount > 0 Then
    ' Filter and count critical alarms (Priority 1-250)
    wwAlarmFilterSelectPriority 1, 250
    criticalCount = wwAlarmTotalRecords()
    
    ' Filter and count high alarms (Priority 251-500)
    wwAlarmFilterSelectPriority 251, 500
    highCount = wwAlarmTotalRecords()
    
    ' Filter and count medium alarms (Priority 501-750)
    wwAlarmFilterSelectPriority 501, 750
    mediumCount = wwAlarmTotalRecords()
    
    ' Filter and count low alarms (Priority 751-999)
    wwAlarmFilterSelectPriority 751, 999
    lowCount = wwAlarmTotalRecords()
    
    ' Store results
    {{CriticalCountTag}} = criticalCount
    {{HighCountTag}} = highCount
    {{MediumCountTag}} = mediumCount
    {{LowCountTag}} = lowCount
    
    LogMessage "Alarm Summary - Critical: " & CStr(criticalCount) & _
              ", High: " & CStr(highCount) & _
              ", Medium: " & CStr(mediumCount) & _
              ", Low: " & CStr(lowCount)
Else
    {{CriticalCountTag}} = 0
    {{HighCountTag}} = 0
    {{MediumCountTag}} = 0
    {{LowCountTag}} = 0
End If

' Reset filter
wwAlarmFilterReset()`,
                notes: 'Adjust priority ranges to match your alarm configuration standards.'
            },
            {
                name: 'Array Data Sort and Filter',
                category: 'Data Manipulation',
                description: 'Sorts array data and filters outliers',
                tags: ['array', 'sort', 'filter', 'outliers'],
                code: `' Sort Array and Remove Outliers
Dim dataArray({{ArraySize}})
Dim sortedArray({{ArraySize}})
Dim i, j, temp
Dim avg, stdDev, threshold

' Populate array from tags
dataArray(0) = {{DataTag1}}
dataArray(1) = {{DataTag2}}
dataArray(2) = {{DataTag3}}
' Add more as needed

' Copy array for sorting
For i = 0 To UBound(dataArray)
    sortedArray(i) = dataArray(i)
Next

' Bubble sort (ascending)
For i = 0 To UBound(sortedArray) - 1
    For j = i + 1 To UBound(sortedArray)
        If sortedArray(i) > sortedArray(j) Then
            temp = sortedArray(i)
            sortedArray(i) = sortedArray(j)
            sortedArray(j) = temp
        End If
    Next
Next

' Calculate average
avg = 0
For i = 0 To UBound(sortedArray)
    avg = avg + sortedArray(i)
Next
avg = avg / (UBound(sortedArray) + 1)

' Store sorted values
{{MinValueTag}} = sortedArray(0)
{{MaxValueTag}} = sortedArray(UBound(sortedArray))
{{MedianValueTag}} = sortedArray(UBound(sortedArray) \ 2)
{{AverageValueTag}} = avg

LogMessage "Data sorted - Min: " & CStr(sortedArray(0)) & _
          ", Max: " & CStr(sortedArray(UBound(sortedArray))) & _
          ", Avg: " & CStr(avg)`,
                notes: 'For large arrays, consider using more efficient sorting algorithms. VBScript limitations apply.'
            },
            {
                name: 'String Data Parser',
                category: 'Data Manipulation',
                description: 'Parses delimited string data into individual components',
                tags: ['string', 'parse', 'split', 'delimiter'],
                code: `' Parse Delimited String Data
Dim inputString, delimiter
Dim parts() As String
Dim i, count

' Configuration
inputString = {{InputStringTag}}
delimiter = "{{Delimiter}}" ' e.g., ",", "|", ";"

' Check if string is not empty
If Len(inputString) > 0 Then
    ' Split string by delimiter
    parts = Split(inputString, delimiter)
    count = UBound(parts) + 1
    
    ' Process each part
    For i = 0 To UBound(parts)
        ' Trim whitespace
        parts(i) = Trim(parts(i))
        
        ' Store in corresponding tags
        Select Case i
            Case 0
                {{Part1Tag}} = parts(i)
            Case 1
                {{Part2Tag}} = parts(i)
            Case 2
                {{Part3Tag}} = parts(i)
            Case 3
                {{Part4Tag}} = parts(i)
            ' Add more cases as needed
        End Select
        
        LogMessage "Part " & CStr(i + 1) & ": " & parts(i)
    Next
    
    {{PartCountTag}} = count
    {{ParseStatusTag}} = 1
    LogMessage "Successfully parsed " & CStr(count) & " parts"
Else
    LogMessage "Input string is empty"
    {{ParseStatusTag}} = 0
    {{PartCountTag}} = 0
End If`,
                notes: 'Commonly used for parsing barcode data, CSV strings, or communication protocol messages.'
            },
            {
                name: 'Timestamp Formatter',
                category: 'Data Manipulation',
                description: 'Formats current timestamp in various formats for logging and display',
                tags: ['timestamp', 'datetime', 'format'],
                code: `' Format Current Timestamp
Dim currentTime
Dim formattedDate, formattedTime, formattedDateTime
Dim isoFormat, logFormat

currentTime = Now

' Standard date format (MM/DD/YYYY)
formattedDate = FormatDateTime(currentTime, vbShortDate)

' Standard time format (HH:MM:SS)
formattedTime = FormatDateTime(currentTime, vbLongTime)

' Combined date and time
formattedDateTime = FormatDateTime(currentTime, vbGeneralDate)

' ISO 8601 format (YYYY-MM-DD HH:MM:SS)
isoFormat = Year(currentTime) & "-" & _
            Right("0" & Month(currentTime), 2) & "-" & _
            Right("0" & Day(currentTime), 2) & " " & _
            Right("0" & Hour(currentTime), 2) & ":" & _
            Right("0" & Minute(currentTime), 2) & ":" & _
            Right("0" & Second(currentTime), 2)

' Log-friendly format with milliseconds
logFormat = Right("0" & Year(currentTime), 4) & _
            Right("0" & Month(currentTime), 2) & _
            Right("0" & Day(currentTime), 2) & "_" & _
            Right("0" & Hour(currentTime), 2) & _
            Right("0" & Minute(currentTime), 2) & _
            Right("0" & Second(currentTime), 2)

' Store in string tags
{{DateTag}} = formattedDate
{{TimeTag}} = formattedTime
{{DateTimeTag}} = formattedDateTime
{{ISOFormatTag}} = isoFormat
{{LogFormatTag}} = logFormat

LogMessage "Timestamp formatted: " & isoFormat`,
                notes: 'Use ISO format for database storage, log format for file naming.'
            }
        ];

        // Add all default scripts
        for (const script of defaultScripts) {
            await this.addScript(script);
        }

        console.log('Default scripts initialized');
    }

    async getScriptCount() {
        const scripts = await this.getAllScripts();
        return scripts.length;
    }
}

// Export for use in app.js
window.ScriptDatabase = ScriptDatabase;
