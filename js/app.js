// Variables
const gastoInput = document.querySelector('#gasto');
const cantidadInput = document.querySelector('#cantidad');
const form = document.querySelector('#agregar-gasto');
const btnSubmit = document.querySelector('#agregar-gasto button[type="submit"]');
const listaGastos = document.querySelector('#gastos ul');
const total = document.querySelector('#total');
const restanteInput = document.querySelector('#restante');
const inputHelp = document.querySelector('.input-help');

document.addEventListener('DOMContentLoaded', () => {
    inputHelp.addEventListener('click', agregarPresupuesto)
    form.addEventListener('submit', validarForm);
})


// Classes
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = presupuesto;
        this.restante = presupuesto;
        this.gastos = [];
    }

    nuevoGasto(obj) {
        this.gastos = [...this.gastos, obj];
        this.calcularRestante();
    }
    
    calcularRestante() {
        const gastado = this.gastos.reduce( (acumulador, gasto) => acumulador + gasto.gastoCantidad, 0 );
        this.restante = this.presupuesto - gastado;
        restanteInput.textContent = this.restante;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();
    }

}

class UI {

    mostrarPresupuesto(cantidad) {
        const { presupuesto, restante } = cantidad;
        total.textContent = presupuesto;
        restanteInput.textContent = restante;
        gastoInput.placeholder = "Ingrese su gasto aqui"
        cantidadInput.placeholder = "Ingrese su cantidad aqui"
        btnSubmit.classList.remove('opacity-manual')
        btnSubmit.disabled = false;
    }

    mostrarAlerta(message, type) {
        const existe = document.querySelector('.helperAlert');
        if(!existe) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('alert', 'text-center', 'helperAlert');
            alerta.textContent = message;
            if(type) {
                alerta.classList.add('alert-danger');
                form.insertBefore(alerta, btnSubmit);
            } else {
                alerta.classList.add('alert-success');
                form.insertBefore(alerta, document.querySelector('#helperDiv'));
            }
            setTimeout(() => {
                alerta.remove();
            }, 2500);
        }
    }

    limpiarHTML() {
        while(listaGastos.firstChild) {
            listaGastos.removeChild(listaGastos.firstChild)
        }
    }

    agregarGastoListado(gastos) {
        this.limpiarHTML();
        gastos.forEach( gasto => {
            const { gastoNombre, gastoCantidad, id } = gasto;
            
            // Crear LI
            const li = document.createElement('LI');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.id = id

            // Agregar el HTML del gasto
            li.innerHTML = `
                ${gastoNombre} <span class="badge badge-primary badge-pill">$${gastoCantidad}</span>
            `;

            // BTN para eliminar
            const btnEliminar = document.createElement('BUTTON');
            btnEliminar.classList.add('btn-danger', 'borrar-gasto', 'btn')
            btnEliminar.textContent = 'X';
            btnEliminar.onclick = () => {
                eliminarGasto(id);
            }

            li.appendChild(btnEliminar)
            listaGastos.appendChild(li);
        })
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const divRestante = document.querySelector('.restante');

        // Comprobar 25%
        if( ( presupuesto / 4 ) > restante ) {
            divRestante.classList.remove('alert-success', 'alert-warning');
            divRestante.classList.add('alert-danger');
        } else if( ( presupuesto / 2 ) > restante ) {
            divRestante.classList.remove('alert-success', 'alert-danger');
            divRestante.classList.add('alert-warning');
        } else {
            divRestante.classList.remove('alert-danger', 'alert-warning');
            divRestante.classList.add('alert-success');
        }

        // Si se agota el presupuesto
        if(restante <= 0) {
            this.mostrarAlerta('El Presupuesto se ha agotado.', 'error');
            btnSubmit.disabled = true;
        } else {
            btnSubmit.disabled = false;
        }

    }

}

let presupuesto;
const ui = new UI();

// Functions
function agregarPresupuesto() {
    const presupuestoUsuario = Number(prompt('¿Cuál es tu Presupuesto?'));
    if(isNaN(presupuestoUsuario) || presupuestoUsuario < 1) {
        alert('El presupuesto debe ser un número mayor a 0')
        setTimeout(() => {
            window.location.reload();
        }, 500);
        return;
    }
    presupuesto = new Presupuesto(presupuestoUsuario)
    inputHelp.remove();
    ui.mostrarPresupuesto(presupuesto);
}

function eliminarGasto(id) {
    const confirmar = confirm('¿Deseas Eliminar el Gasto?');
    if(confirmar) {
        presupuesto.eliminarGasto(id); // Elimina gastos del obj
        ui.agregarGastoListado(presupuesto.gastos); // Elimina gastos del html
        ui.comprobarPresupuesto(presupuesto)
    }
}

function validarForm(e) {
    e.preventDefault();

    if(gastoInput.value === '' || cantidadInput.value === '') {
        ui.mostrarAlerta('Ambos campos son obligatorios', 'error');
        return;
    }
    if(!isNaN(gastoInput.value)) {
        ui.mostrarAlerta('Gasto Inválido', 'error');
        return;
    }
    if(cantidadInput.value <= 0) {
        ui.mostrarAlerta('Presupuesto Inválido', 'error');
        return;
    }
    if(cantidadInput.value > presupuesto.restante) {
        ui.mostrarAlerta('El gasto excede el presupuesto disponible.', 'error');
        return;
    }

    // Crear un objeto del gasto
    const gastoObj = {
        gastoNombre: gastoInput.value,
        gastoCantidad: Number(cantidadInput.value),
        id: Date.now()
    }
    presupuesto.nuevoGasto(gastoObj);

    // Imprimir los gastos
    const { gastos } = presupuesto;
    ui.agregarGastoListado(gastos);

    ui.comprobarPresupuesto(presupuesto)

    ui.mostrarAlerta('Gasto Agregado!');
    form.reset();
}


