# Scripts de Backup e Restore - DIP-AI

Este diretório contém scripts para backup e restore do banco de dados PostgreSQL do projeto DIP-AI.

## Scripts Disponíveis

### 1. backup_db.sh
Script principal para criar backups do banco de dados.

**Características:**
- Suporte para Docker e instalação local do PostgreSQL
- Compressão opcional com gzip
- Backup completo, apenas estrutura ou apenas dados
- Limpeza automática de backups antigos
- Logs detalhados

**Uso:**
```bash
# Backup completo via Docker (padrão)
./scripts/backup_db.sh

# Backup local comprimido
./scripts/backup_db.sh --local --compress

# Backup apenas da estrutura
./scripts/backup_db.sh --schema-only

# Backup apenas dos dados
./scripts/backup_db.sh --data-only

# Backup para diretório específico
./scripts/backup_db.sh --output /path/to/backups
```

**Opções:**
- `-d, --docker`: Usar container Docker (padrão)
- `-l, --local`: Usar instalação local do PostgreSQL
- `-o, --output DIR`: Diretório de saída para backups
- `-c, --compress`: Comprimir backup com gzip
- `-s, --schema-only`: Backup apenas da estrutura
- `-D, --data-only`: Backup apenas dos dados
- `-h, --help`: Exibir ajuda

### 2. restore_db.sh
Script para restaurar backups do banco de dados.

**Características:**
- Suporte para Docker e instalação local
- Restore de arquivos comprimidos e não comprimidos
- Opções para recriar banco, limpar dados existentes
- Verificação de integridade após restore
- Confirmação de segurança para operações destrutivas

**Uso:**
```bash
# Restore básico via Docker
./scripts/restore_db.sh backup.sql

# Restore local forçado (sem confirmação)
./scripts/restore_db.sh --local --force backup.sql.gz

# Recriar banco completamente
./scripts/restore_db.sh --drop-db backup.sql

# Restore apenas dados
./scripts/restore_db.sh --data-only backup.sql
```

**Opções:**
- `-d, --docker`: Usar container Docker (padrão)
- `-l, --local`: Usar instalação local do PostgreSQL
- `-f, --force`: Forçar restore sem confirmação
- `--drop-db`: Apagar e recriar banco antes do restore
- `--clean`: Limpar objetos existentes antes do restore
- `--data-only`: Restore apenas dados
- `--schema-only`: Restore apenas estrutura
- `-v, --verbose`: Saída verbosa
- `-h, --help`: Exibir ajuda

### 3. backup_auto.sh
Script para backups automáticos com diferentes frequências.

**Características:**
- Backups diários, semanais e mensais
- Retenção automática de backups (3 diários, 4 semanais, 8 mensais)
- Verificação de saúde do banco antes do backup
- Logs centralizados
- Sistema de notificações (extensível)

**Uso:**
```bash
# Backup diário
./scripts/backup_auto.sh daily

# Backup semanal
./scripts/backup_auto.sh weekly

# Backup mensal
./scripts/backup_auto.sh monthly
```

## Configuração

### Pré-requisitos
1. Docker e Docker Compose (para modo Docker)
2. PostgreSQL client tools (para modo local)
3. Bash shell
4. Utilitários: gzip, gunzip

### Permissões
Tornar os scripts executáveis:
```bash
chmod +x scripts/*.sh
```

### Variáveis de Ambiente
Os scripts usam as configurações do `docker-compose.yml`:
- `DB_NAME=dipdb`
- `DB_USER=dipuser`
- `DB_PASSWORD=dippassword`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `CONTAINER_NAME=dip-ai-postgres`

## Estrutura de Diretórios

```
backend/
├── scripts/
│   ├── backup_db.sh      # Script principal de backup
│   ├── restore_db.sh     # Script principal de restore
│   ├── backup_auto.sh    # Script de backup automático
│   └── README.md         # Esta documentação
└── backups/              # Diretório de backups (criado automaticamente)
    ├── daily/            # Backups diários
    ├── weekly/           # Backups semanais
    ├── monthly/          # Backups mensais
    └── backup_auto.log   # Log dos backups automáticos
```

## Automação com Cron

Para automatizar os backups, adicione ao crontab:

```bash
# Editar crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * /path/to/DIP-AI/backend/scripts/backup_auto.sh daily

# Backup semanal aos domingos às 3h
0 3 * * 0 /path/to/DIP-AI/backend/scripts/backup_auto.sh weekly

# Backup mensal no dia 1 às 4h
0 4 1 * * /path/to/DIP-AI/backend/scripts/backup_auto.sh monthly
```

## Exemplos de Uso

### Cenário 1: Backup de Desenvolvimento
```bash
# Backup rápido para desenvolvimento
./scripts/backup_db.sh --compress

# Restore em outro ambiente
./scripts/restore_db.sh --force dipdb_backup_20241014_143022.sql.gz
```

### Cenário 2: Migração de Servidor
```bash
# No servidor origem
./scripts/backup_db.sh --compress --output /tmp

# Transferir arquivo para novo servidor
scp /tmp/dipdb_backup_*.sql.gz newserver:/tmp/

# No novo servidor
./scripts/restore_db.sh --drop-db /tmp/dipdb_backup_*.sql.gz
```

### Cenário 3: Backup Apenas de Dados
```bash
# Backup estrutura separadamente
./scripts/backup_db.sh --schema-only --output ./schema

# Backup dados separadamente
./scripts/backup_db.sh --data-only --compress --output ./data
```