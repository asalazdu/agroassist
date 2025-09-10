#!/usr/bin/env python3
"""
Servidor simple para demostrar AgroAssist en el navegador web
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    # Cambiar al directorio donde está el archivo HTML
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    print(f"🌱 AgroAssist - Servidor Web Demo")
    print(f"📁 Directorio: {web_dir}")
    print(f"🌐 Puerto: {PORT}")
    print(f"🔗 URL: http://localhost:{PORT}/web-demo.html")
    print("=" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"✅ Servidor iniciado en http://localhost:{PORT}")
            print(f"📱 Abriendo AgroAssist en el navegador...")
            print("⚠️  Presiona Ctrl+C para detener el servidor")
            print()
            
            # Abrir el navegador automáticamente
            webbrowser.open(f'http://localhost:{PORT}/web-demo.html')
            
            # Mantener el servidor corriendo
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
        print("👋 ¡Gracias por usar AgroAssist!")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: El puerto {PORT} ya está en uso.")
            print("💡 Solución: Cierra otras aplicaciones que usen este puerto o cambia el PORT en este archivo.")
        else:
            print(f"❌ Error al iniciar el servidor: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    start_server()
