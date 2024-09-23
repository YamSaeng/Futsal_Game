//캐릭터카드 생성 함수
function createResultBox(characterInfo) {
  const result_container = document.getElementById('result-container');

  const box = document.createElement('div');
  box.classList.add('text-box');
  if (!characterInfo) {
    box.innerHTML = `
  <p>blank</p>
  `;
  } else {
    for (let key in characterInfo) {
      const text = `${key}: ${characterInfo[key]}`;

      const textp = document.createElement('p');
      textp.textContent = text;

      box.appendChild(textp);
    }
  }

  result_container.appendChild(box);
}

//텍스트결과 생성 함수
function createResultBox2(result) {
  const result_container = document.getElementById('result-container');

  const box = document.createElement('div');
  box.classList.add('text-box2');
  for (let key in result) {
    const text = result[key];

    const textp = document.createElement('p');
    textp.textContent = text;

    box.appendChild(textp);
  }

  result_container.appendChild(box);
}
