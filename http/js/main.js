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
    document.getElementById('squadModal').style.display = 'none';
    document.getElementById('inventoryModal').value = '';
    const response = await fetch(`/FutsalGame/Squad/in-out/${inventoryId}`, {
      method: 'POST',
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
      alert(result.errormessage);
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
    document.getElementById('targetModal').style.display = 'none';
    document.getElementById('target').value = '';
    const response = await fetch(`/FutsalGame/Play/${targetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById('result-container').innerHTML = '';
      await createResultBox2(result);
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
    await createResultBox2(result);
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
    document.getElementById('upgradeModal').style.display = 'none';
    document.getElementById('upgradeId').value = '';
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
      alert(result.errormessage);
      window.location.href = '/Main';
    }
  });

document.getElementById('allcharacter').addEventListener('click', async () => {
  const response = await fetch('/FutsalGame/Character/CheckAll', {
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
    document.getElementById('selectcharacterModal').style.display = 'none';
    document.getElementById('selectcharacterId').value = '';
    const response = await fetch(`/FutsalGame/Character/OneCheck/${Id}`, {
      method: 'GET',
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

document.getElementById('peekinventory').addEventListener('click', async () => {
  document.getElementById('peekModal').style.display = 'block';
});

document
  .getElementById('peekvModalButton')
  .addEventListener('click', async () => {
    const Id = document.getElementById('peekId').value;
    document.getElementById('peekModal').style.display = 'none';
    document.getElementById('peekId').value = '';
    const response = await fetch(`/FutsalGame/Inventory/Check/${Id}`, {
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
      alert(result.error);
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

document.getElementById('pickupten').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Pick-up/All-at-once`, {
    method: 'POST',
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

document.getElementById('allrankcheck').addEventListener('click', async () => {
  const response = await fetch(`/FutsalGame/Ranking/AllCheck`, {
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
    document.getElementById('rankModal').style.display = 'none';
    document.getElementById('rankId').value = '';
    const response = await fetch(`/FutsalGame/Ranking/SingleCheck/${id}`, {
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

document.getElementById('delinven').addEventListener('click', async () => {
  document.getElementById('delModal').style.display = 'block';
});

document
  .getElementById('delModalButton')
  .addEventListener('click', async () => {
    const id = document.getElementById('delId').value;
    document.getElementById('delModal').style.display = 'none';
    document.getElementById('delId').value = '';
    const response = await fetch(`/FutsalGame/Inventory/Delete/${id}`, {
      method: 'DELETE',
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
