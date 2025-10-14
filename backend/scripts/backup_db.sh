#!/bin/bash

# Script de Backup do PostgreSQL para DIP-AI
# Suporta backup via Docker e instalação local

set -e

# Configurações padrão
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="dipdb_backup_${TIMESTAMP}.sql"
COMPRESSED_BACKUP_FILE="dipdb_backup_${TIMESTAMP}.sql.gz"

# Configurações do banco (baseadas no docker-compose.yml)
DB_NAME="dipdb"
DB_USER="dipuser"
DB_PASSWORD="dippassword"
DB_HOST="localhost"
DB_PORT="5432"
CONTAINER_NAME="dip-ai-postgres"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Opções:"
    echo "  -d, --docker          Usar container Docker (padrão)"
    echo "  -l, --local           Usar instalação local do PostgreSQL"
    echo "  -o, --output DIR      Diretório de saída para backups (padrão: ./backups)"
    echo "  -c, --compress        Comprimir backup com gzip"
    echo "  -s, --schema-only     Backup apenas da estrutura (sem dados)"
    echo "  -D, --data-only       Backup apenas dos dados (sem estrutura)"
    echo "  -h, --help            Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0                    # Backup completo via Docker"
    echo "  $0 -l -c             # Backup local comprimido"
    echo "  $0 -s -o /tmp        # Backup apenas estrutura em /tmp"
}

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Função para verificar se o container está rodando
check_docker_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "Container PostgreSQL '$CONTAINER_NAME' não está rodando!"
        echo "Execute: docker-compose up -d postgres"
        exit 1
    fi
}

# Função para verificar se o PostgreSQL local está rodando
check_local_postgres() {
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
        error "PostgreSQL local não está acessível em $DB_HOST:$DB_PORT"
        exit 1
    fi
}

# Função para criar diretório de backup
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Criando diretório de backup: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Função para backup via Docker
backup_docker() {
    log "Iniciando backup via Docker container..."
    check_docker_container
    
    local dump_options=""
    
    if [ "$SCHEMA_ONLY" = true ]; then
        dump_options="$dump_options --schema-only"
    fi
    
    if [ "$DATA_ONLY" = true ]; then
        dump_options="$dump_options --data-only"
    fi
    
    log "Executando pg_dump no container..."
    
    if [ "$COMPRESS" = true ]; then
        docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" $dump_options | gzip > "$BACKUP_DIR/$COMPRESSED_BACKUP_FILE"
        FINAL_BACKUP_FILE="$COMPRESSED_BACKUP_FILE"
    else
        docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" $dump_options > "$BACKUP_DIR/$BACKUP_FILE"
        FINAL_BACKUP_FILE="$BACKUP_FILE"
    fi
}

# Função para backup local
backup_local() {
    log "Iniciando backup via PostgreSQL local..."
    check_local_postgres
    
    local dump_options=""
    
    if [ "$SCHEMA_ONLY" = true ]; then
        dump_options="$dump_options --schema-only"
    fi
    
    if [ "$DATA_ONLY" = true ]; then
        dump_options="$dump_options --data-only"
    fi
    
    log "Executando pg_dump..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if [ "$COMPRESS" = true ]; then
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" $dump_options | gzip > "$BACKUP_DIR/$COMPRESSED_BACKUP_FILE"
        FINAL_BACKUP_FILE="$COMPRESSED_BACKUP_FILE"
    else
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" $dump_options > "$BACKUP_DIR/$BACKUP_FILE"
        FINAL_BACKUP_FILE="$BACKUP_FILE"
    fi
    
    unset PGPASSWORD
}

# Função para limpeza de backups antigos (mantém últimos 10)
cleanup_old_backups() {
    log "Limpando backups antigos (mantendo os 10 mais recentes)..."
    
    cd "$BACKUP_DIR"
    # Remove backups mais antigos, mantendo os 10 mais recentes
    ls -t dipdb_backup_*.sql* 2>/dev/null | tail -n +11 | xargs -r rm -f
    cd - >/dev/null
}

# Função para exibir informações do backup
show_backup_info() {
    local file_path="$BACKUP_DIR/$FINAL_BACKUP_FILE"
    local file_size=$(du -h "$file_path" | cut -f1)
    
    log "Backup concluído com sucesso!"
    echo ""
    echo "Informações do backup:"
    echo "  Arquivo: $file_path"
    echo "  Tamanho: $file_size"
    echo "  Data: $(date)"
    
    if [ "$COMPRESS" = true ]; then
        echo "  Compressão: Ativada (gzip)"
    fi
    
    if [ "$SCHEMA_ONLY" = true ]; then
        echo "  Tipo: Apenas estrutura"
    elif [ "$DATA_ONLY" = true ]; then
        echo "  Tipo: Apenas dados"
    else
        echo "  Tipo: Backup completo"
    fi
}

# Parâmetros padrão
USE_DOCKER=true
COMPRESS=false
SCHEMA_ONLY=false
DATA_ONLY=false

# Parse dos argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--docker)
            USE_DOCKER=true
            shift
            ;;
        -l|--local)
            USE_DOCKER=false
            shift
            ;;
        -o|--output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -c|--compress)
            COMPRESS=true
            shift
            ;;
        -s|--schema-only)
            SCHEMA_ONLY=true
            shift
            ;;
        -D|--data-only)
            DATA_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validações
if [ "$SCHEMA_ONLY" = true ] && [ "$DATA_ONLY" = true ]; then
    error "Não é possível usar --schema-only e --data-only ao mesmo tempo"
    exit 1
fi

# Execução principal
main() {
    log "Iniciando backup do banco de dados DIP-AI..."
    
    create_backup_dir
    
    if [ "$USE_DOCKER" = true ]; then
        backup_docker
    else
        backup_local
    fi
    
    if [ $? -eq 0 ]; then
        show_backup_info
        cleanup_old_backups
        log "Processo de backup finalizado!"
    else
        error "Falha no processo de backup!"
        exit 1
    fi
}

# Executar função principal
main