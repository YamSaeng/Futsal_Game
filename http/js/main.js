const token = localStorage.getItem('authorization');

document.getElementById('inventory').addEventListener('click', async () => {
  const response = await fetch('/FutsalGame/Inventory/Check', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    for (let key in result) {
      createResultBox(result[key]);
    }
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('squadcheck').addEventListener('click', async () => {
  const response = await fetch('/FutsalGame/Squad/Check', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    for (let key in result) {
      createResultBox(result[key]);
    }
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('squadallout').addEventListener('click', async () => {
  const response = await fetch('/FutsalGame/Squad/All-Out', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    alert(result.message);
    window.location.href = '/Main';
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('squadpick').addEventListener('click', async () => {
  document.getElementById('squadModal').style.display = 'block';
});
document
  .getElementById('squadModalButton')
  .addEventListener('click', async () => {
    const inventoryId = document.getElementById('inventoryModal').value;
    const response = await fetch(`/FutsalGame/Squad/in-out/${inventoryId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });
    document.getElementById('squadModal').style.display = 'none';
    document.getElementById('inventoryModal').value = '';
    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      window.location.href = '/Main';
    } else {
      alert(result.message);
      window.location.href = '/Main';
    }
  });

document.getElementById('targetgame').addEventListener('click', async () => {
  document.getElementById('targetModal').style.display = 'block';
});

document
  .getElementById('targetModalButton')
  .addEventListener('click', async () => {
    const targetId = document.getElementById('target').value;
    const response = await fetch(`/FutsalGame/Play/${targetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });

    document.getElementById('targetModal').style.display = 'none';
    document.getElementById('target').value = '';

    const result = await response.json();
    if (response.ok) {
      document.getElementById('result-container').innerHTML = '';
      createResultBox2(result);
    } else {
      alert(result.errormessage);
      window.location.href = '/Main';
    }
  });

document.getElementById('ratinggame').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Rating/Play`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();
  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    createResultBox2(result);
  } else {
    alert(result.errormessage);
    window.location.href = '/Main';
  }
});

document.getElementById('upgrade').addEventListener('click', async () => {
  document.getElementById('upgradeModal').style.display = 'block';
});

document
  .getElementById('upgradeModalButton')
  .addEventListener('click', async () => {
    const inventoryId = document.getElementById('upgradeId').value;
    const response = await fetch(`/FutsalGame/Upgrade/${inventoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });
    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      window.location.href = '/Main';
    } else {
      alert(result.message);
      window.location.href = '/Main';
    }
  });

document.getElementById('allcharacter').addEventListener('click', async () => {
  const response = await fetch('/FutsalGame/Character/Check', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    for (let key in result) {
      createResultBox(result[key]);
    }
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document
  .getElementById('selectcharacter')
  .addEventListener('click', async () => {
    document.getElementById('selectcharacterModal').style.display = 'block';
  });

document
  .getElementById('selectcharacterModalButton')
  .addEventListener('click', async () => {
    const Id = document.getElementById('selectcharacterId').value;
    const response = await fetch(`/FutsalGame/Character/Check/${Id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });
    const result = await response.json();

    document.getElementById('selectcharacterModal').style.display = 'none';
    document.getElementById('selectcharacterId').value = '';

    if (response.ok) {
      document.getElementById('result-container').innerHTML = '';
      createResultBox(result);
    } else {
      alert(result.message);
      window.location.href = '/Main';
    }
  });

document.getElementById('peekinventory').addEventListener('click', async () => {
  document.getElementById('peekModal').style.display = 'block';
});

document
  .getElementById('peekvModalButton')
  .addEventListener('click', async () => {
    const Id = document.getElementById('peekId').value;
    const response = await fetch(`/FutsalGame/Inventory/Check/${Id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });
    const result = await response.json();

    document.getElementById('peekModal').style.display = 'none';
    document.getElementById('peekId').value = '';

    if (response.ok) {
      document.getElementById('result-container').innerHTML = '';
      for (let key in result) {
        createResultBox(result[key]);
      }
    } else {
      alert(result.message);
      window.location.href = '/Main';
    }
  });

document.getElementById('cash').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Cash`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    alert(result.message);
    window.location.href = '/Main';
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('pickup').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Pick-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();

  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    createResultBox(result);
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('allrankcheck').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Ranking/Check`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  });
  const result = await response.json();
  if (response.ok) {
    document.getElementById('result-container').innerHTML = '';
    for (let key in result) {
      createResultBox(result[key]);
    }
  } else {
    alert(result.message);
    window.location.href = '/Main';
  }
});

document.getElementById('rankcheck').addEventListener('click', async () => {
  document.getElementById('rankModal').style.display = 'block';
});

document
  .getElementById('rankvModalButton')
  .addEventListener('click', async () => {
    const id = document.getElementById('rankId').value;
    const response = await fetch(`/FutsalGame/Ranking/Check/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });
    const result = await response.json();
    if (response.ok) {
      document.getElementById('result-container').innerHTML = '';
      for (let key in result) {
        createResultBox(result[key]);
      }
    } else {
      alert(result.message);
      window.location.href = '/Main';
    }
  });
