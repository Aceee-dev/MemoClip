window.addEventListener('DOMContentLoaded', async () => {
  const linkSubCategories: Array<{ key: string; label: string }> = [
    { key: 'Study', label: 'Study Links' },
    { key: 'Sports', label: 'Sports Links' },
    { key: 'News', label: 'News Links' },
    { key: 'OtherLink', label: 'Other Links' }
  ];

  const container = document.getElementById('clipboard-cards');
  const showLinksCheckbox = document.getElementById('show-links') as HTMLInputElement;
  const showTextCheckbox = document.getElementById('show-text') as HTMLInputElement;

  async function updateHistory() {
    // @ts-ignore
    const history = await window.electronAPI.getClipboardHistory();
    if (!container) return;
    container.innerHTML = '';

    const showLinks = showLinksCheckbox.checked;
    const showText = showTextCheckbox.checked;

    // Links card
    if (showLinks) {
      const linksCard = document.createElement('details');
      linksCard.className = 'card';
      linksCard.open = true;
      const linksSummary = document.createElement('summary');
      linksSummary.textContent = 'Links';
      linksCard.appendChild(linksSummary);
      const linksContent = document.createElement('div');
      linksContent.className = 'card-content';
      
      linkSubCategories.forEach(sub => {
        const subCategoryDetails = document.createElement('details');
        subCategoryDetails.className = 'sub-card';
        
        const subCategorySummary = document.createElement('summary');
        subCategorySummary.textContent = sub.label;
        subCategoryDetails.appendChild(subCategorySummary);

        const list = document.createElement('ul');
        (history.Links[sub.key] || []).forEach((item: string) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = item;
          a.textContent = item;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.textDecoration = 'underline';
          a.style.color = '#1976d2';
          li.appendChild(a);
          list.appendChild(li);
        });
        
        subCategoryDetails.appendChild(list);
        linksContent.appendChild(subCategoryDetails);
      });
      linksCard.appendChild(linksContent);
      container.appendChild(linksCard);
    }

    // Text card
    if (showText) {
      const textCard = document.createElement('details');
      textCard.className = 'card';
      textCard.open = true;
      const textSummary = document.createElement('summary');
      textSummary.textContent = 'Text';
      textCard.appendChild(textSummary);
      const textContent = document.createElement('div');
      textContent.className = 'card-content';
      const textList = document.createElement('ul');
      (history.Text || []).forEach((item: string) => {
        const li = document.createElement('li');
        li.textContent = item;
        textList.appendChild(li);
      });
      textContent.appendChild(textList);
      textCard.appendChild(textContent);
      container.appendChild(textCard);
    }
  }

  showLinksCheckbox.addEventListener('change', updateHistory);
  showTextCheckbox.addEventListener('change', updateHistory);

  updateHistory();
  // @ts-ignore
  window.electronAPI.onClipboardUpdate(() => {
    updateHistory();
  });
});
