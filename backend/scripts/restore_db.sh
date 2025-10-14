#!/bin/bash

# Script de Restore do PostgreSQL para DIP-AI
# Suporta restore via Docker e instalação local

set -e

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
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES] ARQUIVO_BACKUP"
    echo ""
    echo "Opções:"
    echo "  -d, --docker          Usar container Docker (padrão)"
    echo "  -l, --local           Usar instalação local do PostgreSQL"
    echo "  -f, --force           Forçar restore sem confirmação"
    echo "  --drop-db             Apagar e recriar banco antes do restore"
    echo "  --clean               Limpar objetos existentes antes do restore"
    echo "  --data-only           Restore apenas dados (sem estrutura)"
    echo "  --schema-only         Restore apenas estrutura (sem dados)"
    echo "  -v, --verbose         Saída verbosa"
    echo "  -h, --help            Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 backup.sql                    # Restore via Docker"
    echo "  $0 -l -f backup.sql.gz          # Restore local forçado"
    echo "  $0 --drop-db backup.sql         # Recriar banco e restore"
    echo "  $0 --data-only backup.sql       # Restore apenas dados"
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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Função para verificar se o arquivo de backup existe
check_backup_file() {
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Arquivo de backup não encontrado: $BACKUP_FILE"
        exit 1
    fi
    
    # Verificar se é um arquivo comprimido
    if [[ "$BACKUP_FILE" =~ \.gz$ ]]; then
        IS_COMPRESSED=true
        log "Detectado arquivo comprimido"
    else
        IS_COMPRESSED=false
    fi
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

# Função para confirmar operação destrutiva
confirm_operation() {
    if [ "$FORCE" = false ]; then
        echo ""
        warning "Esta operação irá modificar/substituir dados no banco '$DB_NAME'!"
        
        if [ "$DROP_DB" = true ]; then
            warning "O banco será COMPLETAMENTE APAGADO e recriado!"
        fi
        
        echo -n "Deseja continuar? [y/N]: "
        read -r response
        
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Operação cancelada pelo usuário"
            exit 0
        fi
    fi
}

# Função para apagar e recriar banco via Docker
drop_create_db_docker() {
    log "Apagando e recriando banco de dados via Docker..."
    
    # Apagar banco
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    
    # Recriar banco
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    
    log "Banco de dados recriado com sucesso"
}

# Função para apagar e recriar banco local
drop_create_db_local() {
    log "Apagando e recriando banco de dados local..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    # Apagar banco
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    
    # Recriar banco
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    
    unset PGPASSWORD
    
    log "Banco de dados recriado com sucesso"
}

# Função para restore via Docker
restore_docker() {
    log "Iniciando restore via Docker container..."
    check_docker_container
    
    if [ "$DROP_DB" = true ]; then
        drop_create_db_docker
    fi
    
    local psql_options=""
    
    if [ "$CLEAN" = true ]; then
        psql_options="$psql_options --clean"
    fi
    
    if [ "$DATA_ONLY" = true ]; then
        psql_options="$psql_options --data-only"
    fi
    
    if [ "$SCHEMA_ONLY" = true ]; then
        psql_options="$psql_options --schema-only"
    fi
    
    if [ "$VERBOSE" = true ]; then
        psql_options="$psql_options --verbose"
    fi
    
    log "Executando restore no container..."
    
    if [ "$IS_COMPRESSED" = true ]; then
        # Para arquivo comprimido
        gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" $psql_options
    else
        # Para arquivo não comprimido
        docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" $psql_options < "$BACKUP_FILE"
    fi
}

# Função para restore local
restore_local() {
    log "Iniciando restore via PostgreSQL local..."
    check_local_postgres
    
    if [ "$DROP_DB" = true ]; then
        drop_create_db_local
    fi
    
    local psql_options=""
    
    if [ "$CLEAN" = true ]; then
        psql_options="$psql_options --clean"
    fi
    
    if [ "$DATA_ONLY" = true ]; then
        psql_options="$psql_options --data-only"
    fi
    
    if [ "$SCHEMA_ONLY" = true ]; then
        psql_options="$psql_options --schema-only"
    fi
    
    if [ "$VERBOSE" = true ]; then
        psql_options="$psql_options --verbose"
    fi
    
    log "Executando restore local..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if [ "$IS_COMPRESSED" = true ]; then
        # Para arquivo comprimido
        gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" $psql_options
    else
        # Para arquivo não comprimido
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" $psql_options < "$BACKUP_FILE"
    fi
    
    unset PGPASSWORD
}

# Função para verificar integridade do restore
verify_restore() {
    log "Verificando integridade do restore..."
    
    if [ "$USE_DOCKER" = true ]; then
        # Verificar via Docker
        table_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    else
        # Verificar localmente
        export PGPASSWORD="$DB_PASSWORD"
        table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
        unset PGPASSWORD
    fi
    
    if [ "$table_count" -gt 0 ]; then
        log "Restore verificado: $table_count tabelas encontradas"
    else
        warning "Nenhuma tabela encontrada após o restore"
    fi
}

# Função para exibir informações do restore
show_restore_info() {
    local file_size=$(du -h "$BACKUP_FILE" | cut -f1)
    
    log "Restore concluído com sucesso!"
    echo ""
    echo "Informações do restore:"
    echo "  Arquivo: $BACKUP_FILE"
    echo "  Tamanho: $file_size"
    echo "  Banco: $DB_NAME"
    echo "  Data: $(date)"
    
    if [ "$IS_COMPRESSED" = true ]; then
        echo "  Arquivo: Comprimido (gzip)"
    fi
    
    if [ "$DROP_DB" = true ]; then
        echo "  Operação: Banco recriado"
    fi
    
    if [ "$SCHEMA_ONLY" = true ]; then
        echo "  Tipo: Apenas estrutura"
    elif [ "$DATA_ONLY" = true ]; then
        echo "  Tipo: Apenas dados"
    else
        echo "  Tipo: Restore completo"
    fi
}

# Função para listar backups disponíveis
list_available_backups() {
    local backup_dir="./backups"
    
    if [ -d "$backup_dir" ]; then
        echo "Backups disponíveis em $backup_dir:"
        echo ""
        ls -la "$backup_dir"/dipdb_backup_*.sql* 2>/dev/null | while read -r line; do
            echo "  $line"
        done
        echo ""
    fi
}

# Parâmetros padrão
USE_DOCKER=true
FORCE=false
DROP_DB=false
CLEAN=false
DATA_ONLY=false
SCHEMA_ONLY=false
VERBOSE=false
IS_COMPRESSED=false
BACKUP_FILE=""

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
        -f|--force)
            FORCE=true
            shift
            ;;
        --drop-db)
            DROP_DB=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --data-only)
            DATA_ONLY=true
            shift
            ;;
        --schema-only)
            SCHEMA_ONLY=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                error "Muitos argumentos: $1"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Validações
if [ -z "$BACKUP_FILE" ]; then
    error "Arquivo de backup não especificado"
    echo ""
    list_available_backups
    show_help
    exit 1
fi

if [ "$SCHEMA_ONLY" = true ] && [ "$DATA_ONLY" = true ]; then
    error "Não é possível usar --schema-only e --data-only ao mesmo tempo"
    exit 1
fi

# Execução principal
main() {
    log "Iniciando restore do banco de dados DIP-AI..."
    
    check_backup_file
    confirm_operation
    
    if [ "$USE_DOCKER" = true ]; then
        restore_docker
    else
        restore_local
    fi
    
    if [ $? -eq 0 ]; then
        verify_restore
        show_restore_info
        log "Processo de restore finalizado!"
    else
        error "Falha no processo de restore!"
        exit 1
    fi
}

# Executar função principal
main