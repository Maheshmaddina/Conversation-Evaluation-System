/* ==========================================================================
   AHOUM CONVERSATION EVALUATION SYSTEM - JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Data Store
  let facetsData = [];
  let conversationsData = [];
  
  // Navigation Tabs controller
  const tabButtons = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons & views
      tabButtons.forEach(b => b.classList.remove('active'));
      viewSections.forEach(s => s.classList.remove('active'));

      // Add active to current button
      btn.classList.add('active');

      // Add active to targeted view
      const targetId = btn.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });

  // Fetch Data from JSON files
  async function loadSystemData() {
    try {
      const facetsResponse = await fetch('data/facets_registry.json');
      facetsData = await facetsResponse.json();

      const convosResponse = await fetch('data/sample_conversations_50.json');
      conversationsData = await convosResponse.json();

      // Initialize the parts of the app
      initializeOverview();
      initializeExplorer();
      initializeBenchmarks();
      initializeSandbox();

    } catch (error) {
      console.error('Error loading Ahoum Eval datasets:', error);
    }
  }

  /* ==========================================================================
     TAB 1: OVERVIEW CONTROLLER
     ========================================================================== */
  function initializeOverview() {
    // KPI Counters
    document.getElementById('kpiFacetsCount').textContent = facetsData.length;
    document.getElementById('kpiConversationsCount').textContent = conversationsData.length;
    
    const categories = [...new Set(facetsData.map(f => f.facet_category))];
    document.getElementById('kpiCategoriesCount').textContent = categories.length;

    const totalConfidence = facetsData.reduce((acc, f) => acc + (f.confidence_threshold || 0), 0);
    const avgConfidence = facetsData.length ? (totalConfidence / facetsData.length) * 100 : 0;
    document.getElementById('kpiAvgConfidence').textContent = avgConfidence.toFixed(1) + '%';

    // Tiers Segmentation Counters
    const tier1 = facetsData.filter(f => f.facet_tier === 'Tier 1').length;
    const tier2 = facetsData.filter(f => f.facet_tier === 'Tier 2').length;
    const tier3 = facetsData.filter(f => f.facet_tier === 'Tier 3').length;
    document.getElementById('tier1Count').textContent = tier1;
    document.getElementById('tier2Count').textContent = tier2;
    document.getElementById('tier3Count').textContent = tier3;

    // Priorities Segmentation Counters
    const priHigh = facetsData.filter(f => f.facet_priority === 'High').length;
    const priMedium = facetsData.filter(f => f.facet_priority === 'Medium').length;
    const priLow = facetsData.filter(f => f.facet_priority === 'Low').length;
    document.getElementById('priorityHighCount').textContent = priHigh;
    document.getElementById('priorityMediumCount').textContent = priMedium;
    document.getElementById('priorityLowCount').textContent = priLow;

    // Category Distribution progress bars
    const categoryCounts = {};
    facetsData.forEach(f => {
      categoryCounts[f.facet_category] = (categoryCounts[f.facet_category] || 0) + 1;
    });

    const categoryList = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    const distributionContainer = document.getElementById('categoryDistributionContainer');
    distributionContainer.innerHTML = '';

    const maxCount = categoryList.length ? categoryList[0][1] : 1;

    categoryList.forEach(([catName, catCount]) => {
      const percentage = (catCount / maxCount) * 100;
      
      const row = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <div class="cat-info">
          <span class="cat-name">${catName}</span>
          <span class="cat-count">${catCount} facets</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: 0%;"></div>
        </div>
      `;

      distributionContainer.appendChild(row);

      // Trigger width animation on next frame
      requestAnimationFrame(() => {
        const fill = row.querySelector('.progress-fill');
        if (fill) {
          fill.style.width = `${percentage}%`;
        }
      });
    });
  }

  /* ==========================================================================
     TAB 2: EXPLORER CONTROLLER
     ========================================================================== */
  const searchInput = document.getElementById('facetSearchInput');
  const catSelect = document.getElementById('filterCategory');
  const tierSelect = document.getElementById('filterTier');
  const priSelect = document.getElementById('filterPriority');
  const tableBody = document.getElementById('facetsTableBody');
  const detailsPlaceholder = document.getElementById('facetDetailsPlaceholder');
  const detailsContent = document.getElementById('facetDetailsContent');

  function initializeExplorer() {
    // Populate Category Dropdown filter
    const categories = [...new Set(facetsData.map(f => f.facet_category))].sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });

    // Wire filter events
    searchInput.addEventListener('input', renderExplorerTable);
    catSelect.addEventListener('change', renderExplorerTable);
    tierSelect.addEventListener('change', renderExplorerTable);
    priSelect.addEventListener('change', renderExplorerTable);

    // Initial render
    renderExplorerTable();
  }

  function renderExplorerTable() {
    const query = searchInput.value.toLowerCase().trim();
    const catFilter = catSelect.value;
    const tierFilter = tierSelect.value;
    const priFilter = priSelect.value;

    const filtered = facetsData.filter(f => {
      // Text match (name, description, id, tags)
      const textMatch = !query || 
        f.facet_id.toLowerCase().includes(query) ||
        f.facet_name.toLowerCase().includes(query) ||
        f.facet_description.toLowerCase().includes(query) ||
        (f.retrieval_tags && f.retrieval_tags.toLowerCase().includes(query));
      
      const catMatch = !catFilter || f.facet_category === catFilter;
      const tierMatch = !tierFilter || f.facet_tier === tierFilter;
      const priMatch = !priFilter || f.facet_priority === priFilter;

      return textMatch && catMatch && tierMatch && priMatch;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dark);">No evaluation facets found matching selected criteria</td></tr>`;
      return;
    }

    filtered.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-heading); font-weight: 600; color: var(--accent-cyan);">${f.facet_id}</td>
        <td>${f.facet_name}</td>
        <td>${f.facet_category}</td>
        <td><span class="badge badge-tier-${f.facet_tier.slice(-1).toLowerCase()}">${f.facet_tier}</span></td>
        <td><span class="badge badge-prio-${f.facet_priority.toLowerCase()}">${f.facet_priority}</span></td>
      `;

      tr.addEventListener('click', () => {
        // Manage row selections
        tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        
        displayFacetDetails(f);
      });

      tableBody.appendChild(tr);
    });
  }

  function displayFacetDetails(facet) {
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'flex';

    // Set simple details
    document.getElementById('detailsFacetId').textContent = facet.facet_id;
    document.getElementById('detailsFacetName').textContent = facet.facet_name;
    document.getElementById('detailsDescription').textContent = facet.facet_description;
    document.getElementById('detailsEvaluationPrompt').textContent = facet.evaluation_prompt;
    document.getElementById('detailsConfidence').textContent = facet.confidence_threshold;
    document.getElementById('detailsSeverity').textContent = facet.severity_weight;
    document.getElementById('detailsScoreDefinition').textContent = facet.score_definition;

    // Badges classes
    const catBadge = document.getElementById('detailsCategoryBadge');
    catBadge.className = 'badge';
    catBadge.textContent = facet.facet_category;
    // Style categories dynamically or use custom styling
    catBadge.style.backgroundColor = 'rgba(255,255,255,0.05)';
    catBadge.style.color = '#fff';

    const tierBadge = document.getElementById('detailsTierBadge');
    tierBadge.className = `badge badge-tier-${facet.facet_tier.slice(-1).toLowerCase()}`;
    tierBadge.textContent = facet.facet_tier;

    const priBadge = document.getElementById('detailsPriorityBadge');
    priBadge.className = `badge badge-prio-${facet.facet_priority.toLowerCase()}`;
    priBadge.textContent = facet.facet_priority;
  }

  /* ==========================================================================
     TAB 3: BENCHMARKS CONTROLLER
     ========================================================================== */
  const convoListContainer = document.getElementById('convoListContainer');
  const chatMessageList = document.getElementById('chatMessageList');
  const convoScoresContainer = document.getElementById('convoScoresContainer');
  const activeConvoTitle = document.getElementById('activeConvoTitle');
  const activeConvoDomain = document.getElementById('activeConvoDomain');

  function initializeBenchmarks() {
    convoListContainer.innerHTML = '';
    
    conversationsData.forEach(convo => {
      const item = document.createElement('button');
      item.className = 'convo-item';

      // Dialogue Preview content
      const firstUserMsg = convo.conversation.find(m => m.role === 'user');
      const previewText = firstUserMsg ? firstUserMsg.content : 'Empty dialogue';

      item.innerHTML = `
        <div class="convo-item-id">${convo.conversation_id}</div>
        <div class="convo-item-domain">${convo.domain}</div>
        <div class="convo-item-preview">${previewText}</div>
      `;

      item.addEventListener('click', () => {
        convoListContainer.querySelectorAll('.convo-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        
        displayConversation(convo);
      });

      convoListContainer.appendChild(item);
    });
  }

  function displayConversation(convo) {
    // Fill headers
    activeConvoTitle.textContent = `Case ${convo.conversation_id}`;
    activeConvoDomain.textContent = convo.domain;

    // Render dialogue bubbles
    chatMessageList.innerHTML = '';
    convo.conversation.forEach(msg => {
      const bubbleWrapper = document.createElement('div');
      bubbleWrapper.className = `msg-bubble-wrapper ${msg.role}`;

      // Format code blocks in markdown
      let formattedContent = msg.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Replace markdown code blocks with HTML pre blocks
      formattedContent = formattedContent.replace(/```python([\s\S]*?)```/g, '<pre><code class="language-python">$1</code></pre>');
      formattedContent = formattedContent.replace(/```javascript([\s\S]*?)```/g, '<pre><code class="language-javascript">$1</code></pre>');
      formattedContent = formattedContent.replace(/```json([\s\S]*?)```/g, '<pre><code class="language-json">$1</code></pre>');
      formattedContent = formattedContent.replace(/```html([\s\S]*?)```/g, '<pre><code class="language-html">$1</code></pre>');
      formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

      // Inline code
      formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');

      bubbleWrapper.innerHTML = `
        <span class="msg-sender">${msg.role}</span>
        <div class="msg-bubble">${formattedContent}</div>
      `;

      chatMessageList.appendChild(bubbleWrapper);
    });

    // Auto-scroll chat log to bottom
    chatMessageList.scrollTop = chatMessageList.scrollHeight;

    // Render score audit cards
    convoScoresContainer.innerHTML = '';
    
    if (!convo.scores || convo.scores.length === 0) {
      convoScoresContainer.innerHTML = `<div style="text-align: center; color: var(--text-dark); font-size: 0.85rem; padding: 1rem;">No scores registered for this case.</div>`;
      return;
    }

    convo.scores.forEach(scoreObj => {
      const facetMeta = facetsData.find(f => f.facet_id === scoreObj.facet) || {
        facet_name: 'Unknown Metric',
        facet_type: 'Unknown',
        severity_weight: 1.0
      };

      const card = document.createElement('div');
      card.className = 'score-audit-card';
      
      // Calculate display rating format based on type
      let scoreDisplay = scoreObj.score;
      if (facetMeta.facet_type === 'Binary') {
        scoreDisplay = scoreObj.score === 1 ? 'PASS (1)' : 'FAIL (0)';
      } else if (facetMeta.facet_type === 'Continuous') {
        scoreDisplay = `${(scoreObj.score * 100).toFixed(0)}%`;
      }

      card.innerHTML = `
        <div class="audit-facet-info">
          <div class="audit-facet-name" title="${facetMeta.facet_name}">${facetMeta.facet_name}</div>
          <div class="audit-score-num">${scoreDisplay}</div>
        </div>
        <div class="audit-meta-row">
          <span>Confidence: ${(scoreObj.confidence * 100).toFixed(0)}%</span>
          <span>Severity: ${facetMeta.severity_weight}</span>
        </div>
        <div class="audit-reasoning">${scoreObj.reasoning}</div>
      `;

      convoScoresContainer.appendChild(card);
    });
  }

  /* ==========================================================================
     TAB 4: SANDBOX CONTROLLER
     ========================================================================== */
  const sandboxTextarea = document.getElementById('sandboxDialogueInput');
  const sandboxFacetList = document.getElementById('sandboxFacetList');
  const runSimulationBtn = document.getElementById('runSimulationBtn');
  
  const sandboxIdle = document.getElementById('sandboxIdleState');
  const sandboxLoading = document.getElementById('sandboxLoadingState');
  const sandboxResults = document.getElementById('sandboxResultsContainer');

  const simSuccessScore = document.getElementById('simSuccessScore');
  const simSuccessBar = document.getElementById('simSuccessBar');
  const sandboxScoresList = document.getElementById('sandboxScoresList');

  // Some default template conversation to prefill
  const defaultDialogue = [
    {
      "role": "user",
      "content": "Hi, I have a quick coding question. Why does this Python code fail with recursion limit?\ndef recurse():\n    return recurse()\nrecurse()"
    },
    {
      "role": "assistant",
      "content": "Hello! The code fails because it makes infinite recursive calls to `recurse()` without any base condition. Python has a default recursion limit (usually 1000) to prevent stack overflow. To resolve this, add a conditional check to terminate the function when a specific limit is reached."
    }
  ];

  function initializeSandbox() {
    // Prefill dialog textarea
    sandboxTextarea.value = JSON.stringify(defaultDialogue, null, 2);

    // List 10 popular facets with check boxes
    const sampleFacetIds = [
      'F-0001', // Conversational Coherence
      'F-0004', // Brevity Adherence
      'F-0077', // Instruction Following
      'F-0105', // Coding Logical Accuracy
      'F-0309', // Greeting Politeness
      'F-0314', // Clear Resolution Framework
      'F-0353'  // Code Syntax Compliance
    ];

    const selectedFacets = facetsData.filter(f => sampleFacetIds.includes(f.facet_id));
    
    sandboxFacetList.innerHTML = '';
    selectedFacets.forEach(f => {
      const label = document.createElement('label');
      label.className = 'sandbox-facet-item';
      label.innerHTML = `
        <input type="checkbox" value="${f.facet_id}" checked style="accent-color: var(--accent-indigo);">
        <span style="font-family: monospace; color: var(--accent-cyan); margin-right: 0.3rem;">${f.facet_id}</span>
        <span>${f.facet_name}</span>
      `;
      sandboxFacetList.appendChild(label);
    });

    // Wire trigger button
    runSimulationBtn.addEventListener('click', runSandboxEvaluation);
  }

  function runSandboxEvaluation() {
    let dialogue = [];
    try {
      dialogue = JSON.parse(sandboxTextarea.value);
      if (!Array.isArray(dialogue)) {
        alert('Invalid dialogue format! Dialogue must be a JSON array of message objects.');
        return;
      }
    } catch (e) {
      alert('Failed to parse JSON dialogue! Please make sure your JSON syntax is correct.');
      return;
    }

    // Check selected facets
    const checkedCheckboxes = sandboxFacetList.querySelectorAll('input[type="checkbox"]:checked');
    if (checkedCheckboxes.length === 0) {
      alert('Please select at least one evaluation facet to audit.');
      return;
    }

    const targetIds = Array.from(checkedCheckboxes).map(cb => cb.value);

    // Enter loading state
    sandboxIdle.style.display = 'none';
    sandboxResults.style.display = 'none';
    sandboxLoading.style.display = 'flex';

    // Simulate audit running (1.5 seconds)
    setTimeout(() => {
      sandboxLoading.style.display = 'none';
      sandboxResults.style.display = 'flex';

      renderSandboxResults(dialogue, targetIds);
    }, 1500);
  }

  function renderSandboxResults(dialogue, targetIds) {
    sandboxScoresList.innerHTML = '';
    let totalScoreNormalized = 0;
    let scoresCount = 0;

    targetIds.forEach(fid => {
      const facet = facetsData.find(f => f.facet_id === fid);
      if (!facet) return;

      // Mock rating selection based on some keyword heuristic or default Satisfactory
      let scoreVal = 4; // Default Satisfactory / Good
      let confidenceVal = 0.85 + (Math.random() * 0.14);
      let reasoningText = '';

      const fullDialogueText = dialogue.map(m => m.content).join(' ').toLowerCase();

      // Simple heuristic based score adjustments
      if (fid === 'F-0353' || fid === 'F-0105') { // Coding facets
        const hasCode = fullDialogueText.includes('def ') || fullDialogueText.includes('class ') || fullDialogueText.includes('`');
        if (hasCode) {
          scoreVal = facet.facet_type === 'Binary' ? 1 : 5;
          reasoningText = `The dialogue contains properly formatted code blocks matching standard syntax compliance rules.`;
        } else {
          scoreVal = facet.facet_type === 'Binary' ? 0 : 2;
          reasoningText = `The conversation requests coding help, but no code samples or syntax block compliance was observed in response.`;
        }
      } else if (fid === 'F-0004') { // Brevity Adherence
        const isLong = fullDialogueText.length > 500;
        if (isLong) {
          scoreVal = 2; // Below average brevity
          reasoningText = `The assistant's responses are overly verbose and exceed standard turn length parameters.`;
        } else {
          scoreVal = 5;
          reasoningText = `The responses are concise, clear, and direct without unnecessary filler text.`;
        }
      } else if (fid === 'F-0309') { // Greeting Politeness
        const hasGreeting = fullDialogueText.includes('hello') || fullDialogueText.includes('hi') || fullDialogueText.includes('welcome');
        if (hasGreeting) {
          scoreVal = 5;
          reasoningText = `The assistant used a warm, polite opening greeting standard to customer support guidelines.`;
        } else {
          scoreVal = 1;
          reasoningText = `The assistant skipped introductory politeness protocols, jumping straight into technical answers.`;
        }
      } else {
        // Fallback standard scoring
        scoreVal = facet.facet_type === 'Binary' ? 1 : 4;
        reasoningText = `The dialogue demonstrates optimal conversational coherence and aligns fully with target evaluation parameters.`;
      }

      // Add to Success Index calculation
      let scorePercentage = 0;
      if (facet.facet_type === 'Binary') {
        scorePercentage = scoreVal === 1 ? 100 : 0;
      } else if (facet.facet_type === 'Continuous') {
        scorePercentage = scoreVal * 100;
      } else { // Likert Scale
        scorePercentage = (scoreVal / 5) * 100;
      }

      totalScoreNormalized += scorePercentage;
      scoresCount++;

      // Create score list item card
      const card = document.createElement('div');
      card.className = 'score-audit-card';
      
      let scoreDisplay = scoreVal;
      if (facet.facet_type === 'Binary') {
        scoreDisplay = scoreVal === 1 ? 'PASS (1)' : 'FAIL (0)';
      } else if (facet.facet_type === 'Continuous') {
        scoreDisplay = `${(scoreVal * 100).toFixed(0)}%`;
      }

      card.innerHTML = `
        <div class="audit-facet-info">
          <div class="audit-facet-name" title="${facet.facet_name}">${facet.facet_name}</div>
          <div class="audit-score-num">${scoreDisplay}</div>
        </div>
        <div class="audit-meta-row">
          <span>Confidence: ${(confidenceVal * 100).toFixed(0)}%</span>
          <span>Type: ${facet.facet_type}</span>
        </div>
        <div class="audit-reasoning">${reasoningText}</div>
      `;

      sandboxScoresList.appendChild(card);
    });

    // Calculate final Success Index
    const finalSuccessIndex = scoresCount ? Math.round(totalScoreNormalized / scoresCount) : 0;
    
    // Animate percentage and progress bar
    simSuccessScore.textContent = `${finalSuccessIndex}%`;
    simSuccessBar.style.width = `${finalSuccessIndex}%`;
  }

  // Kickstart fetching
  loadSystemData();
});
