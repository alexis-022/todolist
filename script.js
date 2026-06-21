var request = new XMLHttpRequest();

request.open('GET', 'https://avwx.rest/api/metar/WLG');

request.setRequestHeader('Authorization', 'VOFTX7gYcM4zvFQVPaZr5vvE6LKv-q_E3tr3nTEhk5A');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log('Status:', this.status);
    console.log('Headers:', this.getAllResponseHeaders());
    console.log('Body:', this.responseText);
  }
};

request.send();
