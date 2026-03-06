document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectedFileName = document.getElementById('selected-file-name');
    const scanBtn = document.getElementById('scan-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const summarySection = document.getElementById('summary-section');
    const summaryContent = document.getElementById('summary-content');

    const readAloudBtn = document.getElementById('read-aloud-btn');
    const translateBtns = document.querySelectorAll('.translate-btn');

    // Chatbot elements
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    // Reminder elements
    const reminderForm = document.getElementById('reminder-form');
    const remindersContainer = document.getElementById('reminders-container');

    // === Mock Data / Summaries ===
    const mockSummary = {
        en: "This document is a proposed legislative bill regarding Data Privacy. Key points:\n\n1. It requires companies to obtain explicit consent before collecting user data.\n2. Users have the right to request deletion of their data at any time.\n3. Companies must report data breaches within 72 hours.\n4. Non-compliance can result in fines up to 5% of global revenue.\n\nIn simple terms: Companies must protect your personal data, ask before using it, and let you delete it.",
        te: "ఇది డేటా గోప్యతకు సంబంధించిన ప్రతిపాదిత చట్టపరమైన బిల్లు. ముఖ్య అంశాలు:\n\n1. వినియోగదారు డేటాను సేకరించే ముందు కంపెనీలు స్పష్టమైన అనుమతి పొందాలి.\n2. ఏ సమయంలోనైనా తమ డేటాను తొలగించమని అభ్యర్థించే హక్కు వినియోగదారులకు ఉంది.\n3. కంపెనీలు 72 గంటల్లో డేటా ఉల్లంఘనలను నివేదించాలి.\n4. పాటించకపోతే ప్రపంచ ఆదాయంలో 5% వరకు జరిమానా విధించవచ్చు.\n\nసరళంగా చెప్పాలంటే: కంపెనీలు మీ వ్యక్తిగత డేటాను రక్షించాలి, దానిని ఉపయోగించే ముందు అడగాలి మరియు దానిని తొలగించడానికి మిమ్మల్ని అనుమతించాలి.",
        hi: "यह डेटा गोपनीयता के संबंध में एक प्रस्तावित विधायी विधेयक है। मुख्य बिंदु:\n\n1. उपयोगकर्ता डेटा एकत्र करने से पहले कंपनियों को स्पष्ट सहमति प्राप्त करनी होगी।\n2. उपयोगकर्ताओं को किसी भी समय अपना डेटा हटाने का अनुरोध करने का अधिकार है।\n3. कंपनियों को 72 घंटे के भीतर डेटा उल्लंघनों की रिपोर्ट करनी होगी।\n4. अनुपालन न करने पर वैश्विक राजस्व के 5% तक का जुर्माना हो सकता है।\n\nसरल शब्दों में: कंपनियों को आपके व्यक्तिगत डेटा की सुरक्षा करनी चाहिए, इसका उपयोग करने से पहले पूछना चाहिए, और आपको इसे हटाने की अनुमति देनी चाहिए।"
    };

    let currentLanguage = 'en';

    // === 1. File Upload Logic ===

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // === 2. Scan and Summarize Logic ===
    let uploadedFile = null;

    function handleFileSelect(file) {
        uploadedFile = file;
        selectedFileName.textContent = `Selected: ${file.name}`;
        scanBtn.disabled = false;
    }

    scanBtn.addEventListener('click', async () => {
        if (!uploadedFile) {
            alert('Please select a file first.');
            return;
        }

        scanBtn.disabled = true;
        loadingSpinner.classList.remove('hidden');
        summarySection.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            console.log('📤 Uploading:', uploadedFile.name);
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('✓ Upload successful');
            
            // Show warning if using fallback (Grok API failed)
            if (data.fallback) {
                console.warn('⚠️ Grok API failed, using extracted text as summary');
                console.log('Grok error:', data.grokError);
            }
            
            mockSummary['en'] = data.summary;

            // Fetch translations from the backend
            try {
                const teResponse = await fetch('http://localhost:5000/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: data.summary, language: 'te' })
                });
                const teData = await teResponse.json();
                mockSummary['te'] = teData.translatedText;

                const hiResponse = await fetch('http://localhost:5000/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: data.summary, language: 'hi' })
                });
                const hiData = await hiResponse.json();
                mockSummary['hi'] = hiData.translatedText;
            } catch (translationError) {
                console.error('Translation error:', translationError);
                // Fallback to placeholder translations if API fails
                mockSummary['te'] = "Telugu translation of:\n\n" + data.summary;
                mockSummary['hi'] = "Hindi translation of:\n\n" + data.summary;
            }

            loadingSpinner.classList.add('hidden');
            summarySection.classList.remove('hidden');

            // Update the display
            summaryContent.textContent = mockSummary[currentLanguage];

            // Auto scroll to summary
            summarySection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
            loadingSpinner.classList.add('hidden');
        } finally {
            scanBtn.disabled = false;
        }
    });

    // === 3. Translation Logic ===
    translateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            translateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Change language
            currentLanguage = btn.dataset.lang;
            summaryContent.textContent = mockSummary[currentLanguage];
        });
    });

    // Set English as active by default
    document.querySelector('.translate-btn[data-lang="en"]').classList.add('active');

    // === 4. Read Aloud Logic (SpeechSynthesis API) ===
    readAloudBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            // Stop any current reading
            window.speechSynthesis.cancel();

            const textToRead = summaryContent.textContent;
            const utterance = new SpeechSynthesisUtterance(textToRead);

            // Basic language mapping for speech synthesis
            if (currentLanguage === 'en') utterance.lang = 'en-US';
            if (currentLanguage === 'te') utterance.lang = 'te-IN';
            if (currentLanguage === 'hi') utterance.lang = 'hi-IN';

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text to speech!");
        }
    });

    // === 5. Chatbot Logic ===
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    async function handleChat() {
        const query = chatInput.value.trim();
        if (!query) return;

        // User message
        appendMessage(query, 'user');
        chatInput.value = '';

        try {
            console.log('📤 Sending chat question:', query);
            
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || `Error (${response.status})`;
                console.error('❌ Chat API error:', errorMsg);
                throw new Error(errorMsg);
            }

            if (!data.answer) {
                throw new Error('No response from AI Assistant');
            }

            console.log('✓ Chat response received');
            appendMessage(data.answer, 'bot');
        } catch (error) {
            console.error('❌ Chat error:', error);
            const errorMsg = error.message || 'Failed to get response from AI Assistant';
            appendMessage(`⚠️ ${errorMsg}`, 'bot');
        }
    }

    sendChatBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // === 6. Reminder Feature Logic ===

    function loadReminders() {
        const reminders = JSON.parse(localStorage.getItem('legislative_reminders')) || [];
        remindersContainer.innerHTML = '';

        if (reminders.length === 0) {
            remindersContainer.innerHTML = '<li style="color: grey; font-size: 0.9rem;">No reminders set.</li>';
            return;
        }

        reminders.forEach((reminder, index) => {
            const li = document.createElement('li');
            li.className = 'reminder-item';

            // Format date for nicer display
            const dateObj = new Date(reminder.date);
            // Handling timezone issues in local development lightly by just formatting what was entered
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

            li.innerHTML = `
                <div class="reminder-info">
                    <strong>${reminder.name}</strong>
                    <span><i class="far fa-clock"></i> ${formattedDate}</span>
                </div>
                <button class="delete-btn" data-index="${index}" title="Delete Reminder">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            remindersContainer.appendChild(li);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                deleteReminder(index);
            });
        });
    }

    function addReminder(name, date) {
        const reminders = JSON.parse(localStorage.getItem('legislative_reminders')) || [];
        reminders.push({ name, date });
        localStorage.setItem('legislative_reminders', JSON.stringify(reminders));
        loadReminders();
    }

    function deleteReminder(index) {
        const reminders = JSON.parse(localStorage.getItem('legislative_reminders')) || [];
        reminders.splice(index, 1);
        localStorage.setItem('legislative_reminders', JSON.stringify(reminders));
        loadReminders();
    }

    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('bill-name').value;
        const date = document.getElementById('reminder-date').value;

        if (name && date) {
            addReminder(name, date);
            reminderForm.reset();
        }
    });

    // Initialize formatting of reminders on page load
    loadReminders();
});
