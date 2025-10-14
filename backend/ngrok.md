```bash
# Ngrok Authentication
ngrok config add-authtoken my_Authtoken

# Comando básico (captura stdout + stderr)
nohup ngrok http --url=distinctly-top-flamingo.ngrok-free.app 80 > ngrok.log 2>&1 &
```