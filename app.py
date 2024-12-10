from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Configuración de la base de datos SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///biblioteca.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'mi_secreto'

db = SQLAlchemy(app)

# Modelos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(100), nullable=False, unique=True)
    telefono = db.Column(db.String(20), nullable=False)
    contrasena_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, contrasena):
        self.contrasena_hash = generate_password_hash(contrasena)

    def check_password(self, contrasena):
        return check_password_hash(self.contrasena_hash, contrasena)

class Libro(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), nullable=False, unique=True)
    disponibilidad = db.Column(db.Boolean, default=True)

class Prestamo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey('libro.id'), nullable=False)
    fecha_prestamo = db.Column(db.String(20), nullable=False)
    estado = db.Column(db.String(20), default="activo")

class Reserva(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey('libro.id'), nullable=False)
    fecha_reserva = db.Column(db.String(20), nullable=False)

# Crear la base de datos
with app.app_context():
    db.create_all()

# Endpoints

@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuario.query.all()
    resultado = [{"id": usuario.id, "nombre": usuario.nombre, "correo": usuario.correo, "telefono": usuario.telefono} for usuario in usuarios]
    return jsonify(resultado)

@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    datos = request.get_json()
    nombre = datos.get('nombre')
    correo = datos.get('correo')
    telefono = datos.get('telefono')
    contrasena = datos.get('contrasena')

    if not (nombre and correo and contrasena):
        return jsonify({'error': 'Nombre, correo y contraseña son obligatorios'}), 400

    usuario_existente = Usuario.query.filter_by(correo=correo).first()
    if usuario_existente:
        return jsonify({'error': 'El correo ya está registrado'}), 400

    nuevo_usuario = Usuario(nombre=nombre, correo=correo, telefono=telefono)
    nuevo_usuario.set_password(contrasena)

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({'mensaje': 'Usuario registrado exitosamente'})

@app.route('/libros', methods=['POST'])
def crear_libro():
    data = request.get_json()
    nuevo_libro = Libro(titulo=data['titulo'], autor=data['autor'], isbn=data['isbn'], disponibilidad=True)
    db.session.add(nuevo_libro)
    db.session.commit()
    return jsonify({"mensaje": "Libro agregado exitosamente"}), 201

@app.route('/libros', methods=['GET'])
def obtener_libros():
    libros = Libro.query.all()
    resultado = [{"id": libro.id, "titulo": libro.titulo, "autor": libro.autor, "isbn": libro.isbn, "disponibilidad": libro.disponibilidad} for libro in libros]
    return jsonify(resultado)

@app.route('/prestamos', methods=['POST'])
def registrar_prestamo():
    data = request.get_json()
    usuario_id = data.get('usuario_id')
    libro_id = data.get('libro_id')
    fecha_prestamo = data.get('fecha_prestamo')

    if not usuario_id or not libro_id or not fecha_prestamo:
        return jsonify({"error": "Datos incompletos. usuario_id, libro_id y fecha_prestamo son obligatorios."}), 400

    libro = Libro.query.get(libro_id)
    if not libro or not libro.disponibilidad:
        return jsonify({"mensaje": "El libro no está disponible"}), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"mensaje": "El usuario no existe"}), 404

    nuevo_prestamo = Prestamo(usuario_id=usuario_id, libro_id=libro_id, fecha_prestamo=fecha_prestamo)
    libro.disponibilidad = False
    db.session.add(nuevo_prestamo)
    db.session.commit()

    return jsonify({"mensaje": "Préstamo registrado exitosamente"}), 201

@app.route('/reservas', methods=['POST'])
def reservar_libro():
    data = request.get_json()

    usuario_id = data.get('usuario_id')
    libro_id = data.get('libro_id')
    fecha_reserva = data.get('fecha_reserva')

    if not usuario_id or not libro_id or not fecha_reserva:
        return jsonify({"error": "Datos incompletos. usuario_id, libro_id y fecha_reserva son obligatorios."}), 400

    libro = Libro.query.get(libro_id)
    if not libro:
        return jsonify({"mensaje": "El libro no existe"}), 404
    if not libro.disponibilidad:
        return jsonify({"mensaje": "El libro no está disponible para reserva"}), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"mensaje": "El usuario no existe"}), 404

    nueva_reserva = Reserva(usuario_id=usuario_id, libro_id=libro_id, fecha_reserva=fecha_reserva)
    libro.disponibilidad = False
    db.session.add(nueva_reserva)
    db.session.commit()

    return jsonify({"mensaje": "Reserva registrada exitosamente"}), 201

@app.route('/reportes', methods=['GET'])
def generar_reporte():
    tipo = request.args.get('tipo')
    if tipo == 'prestamos':
        prestamos = Prestamo.query.all()
        reporte = [{"usuario_id": p.usuario_id, "libro_id": p.libro_id, "fecha_prestamo": p.fecha_prestamo, "estado": p.estado} for p in prestamos]
        return jsonify(reporte)

    elif tipo == 'disponibles':
        libros = Libro.query.filter_by(disponibilidad=True).all()
        reporte = [{"id": l.id, "titulo": l.titulo, "autor": l.autor} for l in libros]
        return jsonify(reporte)

    else:
        return jsonify({"mensaje": "Tipo de reporte no válido"}), 400

@app.route('/reservas', methods=['GET'])
def obtener_reservas():
    reservas = Reserva.query.all()
    resultado = [
        {
            "id": reserva.id,
            "usuario_id": reserva.usuario_id,
            "libro_id": reserva.libro_id,
            "fecha_reserva": reserva.fecha_reserva
        }
        for reserva in reservas
    ]
    return jsonify(resultado), 200

@app.route('/prestamos', methods=['GET'])
def obtener_prestamos():
    prestamos = Prestamo.query.all()
    resultado = [
        {
            "id": prestamo.id,
            "usuario_id": prestamo.usuario_id,
            "libro_id": prestamo.libro_id,
            "fecha_prestamo": prestamo.fecha_prestamo,
            "estado": prestamo.estado
        }
        for prestamo in prestamos
    ]
    return jsonify(resultado), 200

@app.route('/login', methods=['POST'])
def login():
    datos = request.get_json()
    correo = datos.get('correo')
    contrasena = datos.get('contrasena')

    if not (correo and contrasena):
        return jsonify({'error': 'Correo y contraseña son obligatorios'}), 400

    usuario = Usuario.query.filter_by(correo=correo).first()
    if usuario and usuario.check_password(contrasena):
        session['usuario_id'] = usuario.id  # Guardamos el usuario en la sesión
        return jsonify({'mensaje': 'Inicio de sesión exitoso'})
    return jsonify({'error': 'Correo o contraseña incorrectos'}), 401

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
