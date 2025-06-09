function analisarDesligamento(csvText) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const timestamps = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    if (cols.length > 0) {
      const strDate = cols[0].trim();
      const [datePart, timePart] = strDate.split(' ');
      if (!datePart || !timePart) continue;
      const [day, month, year] = datePart.split('/');
      const [hour, minute, second] = timePart.split(':');
      const dt = new Date(+year, +month - 1, +day, +hour, +minute, +second);
      if (!isNaN(dt.getTime())) timestamps.push(dt);
    }
  }

  const result = [];

  for (let i = 1; i < timestamps.length; i++) {
    const diffMs = timestamps[i].getTime() - timestamps[i - 1].getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes >= 1) {
      const status = minutes >= 5 ? 'Salto > 5 min!' : 'Salto detectado';
      const formatDate = (d) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
      };
      result.push([formatDate(timestamps[i - 1]), formatDate(timestamps[i]), `${minutes}`, status]);
    }
  }

  return result;
}

module.exports = { analisarDesligamento };
