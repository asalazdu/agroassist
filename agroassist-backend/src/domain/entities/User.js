class User {
  constructor({ id = null, nombre_completo, correo, contrasena, rol = 2 }) {
    this.id = id;
    this.nombre_completo = nombre_completo;
    this.correo = correo;
    this.contrasena = contrasena;
    this.rol = rol;
  }
}

module.exports = User;
