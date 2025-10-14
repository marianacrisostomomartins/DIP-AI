#!/bin/bash

# Script automatizado de backup periódico para DIP-AI
# Executa backups automaticamente e gerencia retenção

set -e

# Configurações
BACKUP_SCRIPT_DIR="$(dirname "$0")"
BACKUP_SCRIPT="$BACKUP_SCRIPT_DIR/backup_db.sh"
BACKUP_DIR="./backups"
LOG_FILE="$BACKUP_DIR/backup_auto.log"

# Configurações de retenção
DAILY_RETENTION=3    # manter 3 backups diários
WEEKLY_RETENTION=4   # manter 4 backups semanais
MONTHLY_RETENTION=8   # manter 8 backups mensais

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${GREEN}${message}${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[ERROR] $1"
    echo -e "${RED}${message}${NC}" >&2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"
}

# Função para verificar se o script de backup existe
check_backup_script() {
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        error "Script de backup não encontrado: $BACKUP_SCRIPT"
        exit 1
    fi
    
    if [ ! -x "$BACKUP_SCRIPT" ]; then
        log "Tornando script de backup executável..."
        chmod +x "$BACKUP_SCRIPT"
    fi
}

# Função para criar diretórios necessários
setup_directories() {
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}
    touch "$LOG_FILE"
}

# Função para backup diário
daily_backup() {
    log "Iniciando backup diário..."
    
    local daily_dir="$BACKUP_DIR/daily"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="dipdb_daily_${timestamp}.sql.gz"
    
    "$BACKUP_SCRIPT" --docker --compress --output "$daily_dir"
    
    if [ $? -eq 0 ]; then
        log "Backup diário concluído: $backup_file"
        cleanup_daily_backups
    else
        error "Falha no backup diário"
        return 1
    fi
}

# Função para backup semanal (domingo)
weekly_backup() {
    log "Iniciando backup semanal..."
    
    local weekly_dir="$BACKUP_DIR/weekly"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="dipdb_weekly_${timestamp}.sql.gz"
    
    "$BACKUP_SCRIPT" --docker --compress --output "$weekly_dir"
    
    if [ $? -eq 0 ]; then
        log "Backup semanal concluído: $backup_file"
        cleanup_weekly_backups
    else
        error "Falha no backup semanal"
        return 1
    fi
}

# Função para backup mensal (dia 1)
monthly_backup() {
    log "Iniciando backup mensal..."
    
    local monthly_dir="$BACKUP_DIR/monthly"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="dipdb_monthly_${timestamp}.sql.gz"
    
    "$BACKUP_SCRIPT" --docker --compress --output "$monthly_dir"
    
    if [ $? -eq 0 ]; then
        log "Backup mensal concluído: $backup_file"
        cleanup_monthly_backups
    else
        error "Falha no backup mensal"
        return 1
    fi
}

# Função para limpeza de backups diários
cleanup_daily_backups() {
    local daily_dir="$BACKUP_DIR/daily"
    
    cd "$daily_dir"
    local count=$(ls -1 dipdb_daily_*.sql.gz 2>/dev/null | wc -l)
    
    if [ "$count" -gt "$DAILY_RETENTION" ]; then
        local to_remove=$((count - DAILY_RETENTION))
        log "Removendo $to_remove backup(s) diário(s) antigo(s)..."
        ls -t dipdb_daily_*.sql.gz | tail -n "$to_remove" | xargs rm -f
    fi
    
    cd - >/dev/null
}

# Função para limpeza de backups semanais
cleanup_weekly_backups() {
    local weekly_dir="$BACKUP_DIR/weekly"
    
    cd "$weekly_dir"
    local count=$(ls -1 dipdb_weekly_*.sql.gz 2>/dev/null | wc -l)
    
    if [ "$count" -gt "$WEEKLY_RETENTION" ]; then
        local to_remove=$((count - WEEKLY_RETENTION))
        log "Removendo $to_remove backup(s) semanal(is) antigo(s)..."
        ls -t dipdb_weekly_*.sql.gz | tail -n "$to_remove" | xargs rm -f
    fi
    
    cd - >/dev/null
}

# Função para limpeza de backups mensais
cleanup_monthly_backups() {
    local monthly_dir="$BACKUP_DIR/monthly"
    
    cd "$monthly_dir"
    local count=$(ls -1 dipdb_monthly_*.sql.gz 2>/dev/null | wc -l)
    
    if [ "$count" -gt "$MONTHLY_RETENTION" ]; then
        local to_remove=$((count - MONTHLY_RETENTION))
        log "Removendo $to_remove backup(s) mensal(is) antigo(s)..."
        ls -t dipdb_monthly_*.sql.gz | tail -n "$to_remove" | xargs rm -f
    fi
    
    cd - >/dev/null
}

# Função para verificar saúde do banco
check_database_health() {
    log "Verificando saúde do banco de dados..."
    
    if docker ps | grep -q "dip-ai-postgres"; then
        if docker exec dip-ai-postgres pg_isready -U dipuser -d dipdb >/dev/null 2>&1; then
            log "Banco de dados está saudável"
            return 0
        else
            error "Banco de dados não está respondendo"
            return 1
        fi
    else
        error "Container PostgreSQL não está rodando"
        return 1
    fi
}

# Função para enviar notificação (pode ser customizada)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Aqui você pode adicionar integração com:
    # - Email
    # - Slack
    # - Discord
    # - Webhook
    
    log "Notificação [$status]: $message"
}

# Função principal
main() {
    local backup_type="${1:-daily}"
    
    log "Iniciando backup automático tipo: $backup_type"
    
    check_backup_script
    setup_directories
    
    # Verificar saúde do banco antes do backup
    if ! check_database_health; then
        error "Cancelando backup devido a problemas no banco de dados"
        send_notification "ERROR" "Backup cancelado - banco não está saudável"
        exit 1
    fi
    
    case "$backup_type" in
        "daily")
            if daily_backup; then
                send_notification "SUCCESS" "Backup diário concluído com sucesso"
            else
                send_notification "ERROR" "Falha no backup diário"
                exit 1
            fi
            ;;
        "weekly")
            if weekly_backup; then
                send_notification "SUCCESS" "Backup semanal concluído com sucesso"
            else
                send_notification "ERROR" "Falha no backup semanal"
                exit 1
            fi
            ;;
        "monthly")
            if monthly_backup; then
                send_notification "SUCCESS" "Backup mensal concluído com sucesso"
            else
                send_notification "ERROR" "Falha no backup mensal"
                exit 1
            fi
            ;;
        *)
            error "Tipo de backup inválido: $backup_type"
            echo "Uso: $0 [daily|weekly|monthly]"
            exit 1
            ;;
    esac
    
    log "Backup automático finalizado"
}

# Executar função principal
main "$@"