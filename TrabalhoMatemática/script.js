// Configuração inicial do estacionamento
const rows = 4;
const cols = 5;
const parkingGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
const validStates = ["MG", "GO", "DF"];
const stateRanges = {
  MG: /^[G-L]/,
  GO: /^[K-L]/,
  DF: /^JH/
};

// Tarifa do estacionamento
const baseRate = 5.0; // Até 3 horas
const hourlyRate = 2.0; // Hora adicional ou fração

// Atualiza a grade de estacionamento na interface
function renderGrid() {
  const gridElement = document.getElementById("parking-grid");
  gridElement.innerHTML = "";
  parkingGrid.forEach((row, i) => {
    row.forEach((slot, j) => {
      const div = document.createElement("div");
      div.className = "slot" + (slot ? " occupied" : "");
      div.textContent = slot ? slot.plate : `Vaga ${i + 1}-${j + 1}`;
      gridElement.appendChild(div);
    });
  });
}

// Insere um veículo na primeira vaga disponível
function parkVehicle(plate, entryTime) {
  const [rowIndex, colIndex] = findEmptySlot();
  if (rowIndex === null) {
    alert("Estacionamento cheio!");
    return;
  }

  const state = getStateFromPlate(plate);
  if (!state) {
    alert("Placa inválida ou de estado não permitido!");
    return;
  }

  parkingGrid[rowIndex][colIndex] = { plate, entryTime, state };
  alert(
    `Veículo ${plate} estacionado na vaga ${rowIndex + 1}-${colIndex + 1}\nEstado: ${state}`
  );
  renderGrid();
}

// Remove um veículo e calcula o valor
function removeVehicle(plate, exitTime) {
  const slot = findSlotByPlate(plate);
  if (!slot) {
    alert("Veículo não encontrado!");
    return;
  }

  const { row, col, entryTime, state } = slot;
  const duration = calculateDuration(entryTime, exitTime);
  const amount = calculateFee(duration);
  parkingGrid[row][col] = null;

  alert(
    `Veículo ${plate} saiu.\nEstado: ${state}\nTempo: ${duration} horas\nTotal: R$ ${amount.toFixed(
      2
    )}`
  );
  renderGrid();
}

// Auxiliares
function findEmptySlot() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!parkingGrid[i][j]) return [i, j];
    }
  }
  return [null, null];
}

function findSlotByPlate(plate) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (parkingGrid[i][j]?.plate === plate) {
        return { row: i, col: j, ...parkingGrid[i][j] };
      }
    }
  }
  return null;
}

function calculateDuration(entryTime, exitTime) {
  const [entryHours, entryMinutes] = entryTime.split(":").map(Number);
  const [exitHours, exitMinutes] = exitTime.split(":").map(Number);

  const entry = entryHours * 60 + entryMinutes;
  const exit = exitHours * 60 + exitMinutes;

  return Math.ceil((exit - entry) / 60);
}

function calculateFee(hours) {
  if (hours <= 3) return baseRate;
  return baseRate + (hours - 3) * hourlyRate;
}

function getStateFromPlate(plate) {
  for (const state in stateRanges) {
    if (stateRanges[state].test(plate)) return state;
  }
  return null;
}

// Eventos de formulário
document.getElementById("entry-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const plate = document.getElementById("plate").value.toUpperCase();
  const entryTime = document.getElementById("entry-time").value;
  parkVehicle(plate, entryTime);
});

document.getElementById("exit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const plate = document.getElementById("exit-plate").value.toUpperCase();
  const exitTime = document.getElementById("exit-time").value;
  removeVehicle(plate, exitTime);
});

// Render inicial
renderGrid();
