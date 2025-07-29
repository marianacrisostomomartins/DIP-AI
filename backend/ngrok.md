```bash
# Comando básico (captura stdout + stderr)
nohup ngrok http --url=distinctly-top-flamingo.ngrok-free.app 80 > ngrok.log 2>&1 &

# Para capturar absolutamente tudo
script -c "ngrok http --url=distinctly-top-flamingo.ngrok-free.app 80" ngrok.log &
```