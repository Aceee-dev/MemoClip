window.addEventListener('DOMContentLoaded', async () => {
  const linkSubCategories: Array<{ key: string; label: string }> = [
    { key: 'Study', label: 'Study Links' },
    { key: 'Sports', label: 'Sports Links' },
    { key: 'News', label: 'News Links' },
    { key: 'OtherLink', label: 'Other Links' }
  ];

  const container = document.createElement('div');
  container.id = 'clipboard-cards';
  document.body.appendChild(container);

  async function updateHistory() {
    // @ts-ignore
    const history = await window.electronAPI.getClipboardHistory();
    container.innerHTML = '';
    // Links card with subcategories
    const linksCard = document.createElement('div');
    linksCard.className = 'card';
    const linksHeading = document.createElement('h3');
    linksHeading.textContent = 'Links';
    linksCard.appendChild(linksHeading);
    linkSubCategories.forEach(sub => {
      const subHeading = document.createElement('h4');
      subHeading.textContent = sub.label;
      linksCard.appendChild(subHeading);
      const list = document.createElement('ul');
      (history.Links[sub.key] || []).forEach((item: string) => {
        const li = document.createElement('li');
        // Make links clickable
        const linkMatch = item.match(/https?:\/\/.+/);
        if (linkMatch) {
          const a = document.createElement('a');
          a.href = item;
          a.textContent = item;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.textDecoration = 'underline';
          a.style.color = '#388e3c';
          li.appendChild(a);
        } else {
          li.textContent = item;
        }
        list.appendChild(li);
      });
      linksCard.appendChild(list);
    });
    container.appendChild(linksCard);

    // Text card only
    const textCard = document.createElement('div');
    textCard.className = 'card';
    const textHeading = document.createElement('h3');
    textHeading.textContent = 'Text';
    textCard.appendChild(textHeading);
    const textList = document.createElement('ul');
    (history.Text || []).forEach((item: string) => {
      const li = document.createElement('li');
      li.textContent = item;
      textList.appendChild(li);
    });
    textCard.appendChild(textList);
    container.appendChild(textCard);
  }

  updateHistory();
  setInterval(updateHistory, 2000);
});
