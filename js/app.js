//1. buscamos el DOM los elementos que necesitamos

console.log("JavaScript cargado correctamente");
const formulario = document.getElementById("registroUsuario");
const rutInput = document.getElementById("rut");
const fechaNacimientoInput = document.getElementById("fechaNacimiento");
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("passwordConfirm");
const direccionInput = document.getElementById("direccion");
const mensajeRegistro = document.getElementById("mensajeRegistro");

//2. creamos funciones de validación para cada campo
function validaRut(rut) {// función para validar el RUT chileno sacada absolutamente de internet, no es mía

  // Eliminar puntos y guion
  const rutSinFormato = rut.replace(/\./g, "")
    .replace(/-/g, "")
    .trim()
    .toUpperCase();

  // Validar formato: 7 u 8 números y dígito verificador
  const regex = /^[0-9]{7,8}[0-9K]$/;

  if (!regex.test(rutSinFormato)) {
    return false;
  }

  // Separar número y dígito verificador
  const numero = rutSinFormato.slice(0, -1);
  const dv = rutSinFormato.slice(-1);

  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;

  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i]) * multiplicador;

    multiplicador++;

    if (multiplicador > 7) {
      multiplicador = 2;
    }
  }

  const resto = suma % 11;
  const resultado = 11 - resto;

  let dvCalculado;

  if (resultado === 11) {
    dvCalculado = "0";
  } else if (resultado === 10) {
    dvCalculado = "K";
  } else {
    dvCalculado = resultado.toString();
  }

  return dv === dvCalculado;
}

function validaFechaNacimiento(fechaNacimiento) {
  if (!fechaNacimiento) {
    return false;
  }
  const fecha = new Date(fechaNacimiento + "T00:00:00");
  const hoy = new Date();

  if (isNaN(fecha.getTime()) || fecha > hoy) {
    return false;
  }

  let edad = hoy.getFullYear() - fecha.getFullYear();

  const mes = hoy.getMonth() - fecha.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  return edad >= 13;
}

function validaNombreUsuario(nombreUsuario) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(nombreUsuario.trim());
}

function validaNombre(nombre) {
  const regex = /^[a-zA-Z\s]{2,20}$/;
  return regex.test(nombre.trim());
}
function validaApellido(apellido) {
  const regex = /^[a-zA-Z\s]{2,20}$/;
  return regex.test(apellido.trim());
}
function validaEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}
function validaPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*[0-9]).{6,18}$/;
  return regex.test(password.trim());
}
function validaConfirmPassword(password, confirmPassword) {
  return password !== "" &&
    confirmPassword !== "" &&
    password === confirmPassword;
}
function validaDireccion(direccion) {
  return direccion.trim() !== "";
}
function mostrarError(input, mensaje) {
  const errorElement = input.nextElementSibling;
  errorElement.textContent = mensaje;
  errorElement.style.display = "block";
}

//3. agregamos un evento al formulario para validar los datos antes de enviarlos
formulario.addEventListener("submit", function (event) {
  event.preventDefault(); // Evita que el formulario se envíe automáticamente
  // Aquí iría la lógica de validación y envío del formulario
  //.value lee el valor del input, .trim() elimina espacios al inicio y al final
  const rut = rutInput.value.trim();
  const nombreUsuario = nombreUsuarioInput.value.trim();
  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const email = emailInput.value.trim();

  //Aplicamos reglas de validación a cada campo

  const nombreUsuarioCorrecto = validaNombreUsuario(nombreUsuario);
  const rutCorrecto = validaRut(rut);
  const nombreCorrecto = validaNombre(nombre);
  const apellidoCorrecto = validaApellido(apellido);
  const emailCorrecto = validaEmail(email);
  const passwordCorrecto = validaPassword(passwordInput.value.trim());
  const confirmPasswordCorrecto = validaConfirmPassword(passwordInput.value.trim(), confirmPasswordInput.value.trim());
  const direccionCorrecta = validaDireccion(direccionInput.value.trim());
  const fechaNacimientoCorrecta = validaFechaNacimiento(fechaNacimientoInput.value.trim());

  //bootstrap alert 

  rutInput.classList.toggle("is-valid", rutCorrecto);
  rutInput.classList.toggle("is-invalid", !rutCorrecto);

  nombreUsuarioInput.classList.toggle("is-valid", nombreUsuarioCorrecto);
  nombreUsuarioInput.classList.toggle("is-invalid", !nombreUsuarioCorrecto);

  nombreInput.classList.toggle("is-valid", nombreCorrecto);
  nombreInput.classList.toggle("is-invalid", !nombreCorrecto);

  apellidoInput.classList.toggle("is-valid", apellidoCorrecto);
  apellidoInput.classList.toggle("is-invalid", !apellidoCorrecto);

  emailInput.classList.toggle("is-valid", emailCorrecto);
  emailInput.classList.toggle("is-invalid", !emailCorrecto);

  passwordInput.classList.toggle("is-valid", passwordCorrecto);
  passwordInput.classList.toggle("is-invalid", !passwordCorrecto);

  confirmPasswordInput.classList.toggle("is-valid", confirmPasswordCorrecto);
  confirmPasswordInput.classList.toggle("is-invalid", !confirmPasswordCorrecto);

  fechaNacimientoInput.classList.toggle("is-valid", fechaNacimientoCorrecta);
  fechaNacimientoInput.classList.toggle("is-invalid", !fechaNacimientoCorrecta);

  //mostrar resultado de validación
  mensajeRegistro.className = "alert mt-4" +
    (rutCorrecto && nombreUsuarioCorrecto && nombreCorrecto && apellidoCorrecto && emailCorrecto
      && passwordCorrecto && confirmPasswordCorrecto && fechaNacimientoCorrecta ?
      " alert-success" : " alert-danger");

  if (rutCorrecto && nombreUsuarioCorrecto && nombreCorrecto && apellidoCorrecto && emailCorrecto
    && passwordCorrecto && confirmPasswordCorrecto && fechaNacimientoCorrecta) {
    mensajeRegistro.textContent = "Formulario Correcto, enviando datos..." + nombreUsuario +
      "el registro se enviará a la base de datos";
  }
  else {
    mensajeRegistro.textContent = "Formulario Incorrecto, por favor revise los campos resaltados e intente nuevamente.";
  }
  console.log("resultado de validación:", {
    rutCorrecto,
    nombreUsuarioCorrecto,
    nombreCorrecto,
    apellidoCorrecto,
    emailCorrecto,
    passwordCorrecto,
    confirmPasswordCorrecto,
    direccionCorrecta,
    fechaNacimientoCorrecta
  });
});
//Al presionar limpiar, se eliminan los estilos de validación y el mensaje
formulario.addEventListener("reset", function () {
  rutInput.classList.remove("is-invalid", "is-valid");
  nombreUsuarioInput.classList.remove("is-invalid", "is-valid");
  nombreInput.classList.remove("is-invalid", "is-valid");
  apellidoInput.classList.remove("is-invalid", "is-valid");
  emailInput.classList.remove("is-invalid", "is-valid");
  passwordInput.classList.remove("is-invalid", "is-valid");
  confirmPasswordInput.classList.remove("is-invalid", "is-valid");
  //direccionInput.classList.remove("is-invalid", "is-valid");
  fechaNacimientoInput.classList.remove("is-invalid", "is-valid");
  mensajeRegistro.textContent = "";
  mensajeRegistro.className = "d-none mt-4";
});
