#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#define LABELSZ 128

struct global_args_t {
    int raw;     /* Generate v2.0 RAW for logisim */
    char *out_file; /* Output file name */
    char *in_file;    /* Input file */
} global_args;

static const char *opt_string = "Ro:";
    
struct instr {
    char *label, *op, *opnd;
    int id, mri, indirect;
};

struct instr_list {
    int n, size;
    struct instr **instr;
};

void
instr_list_init(struct instr_list *list)
{
    list->n = 0;
    list->size = 2; /* TODO: Make this a reasonable one */
    list->instr = malloc(list->size * sizeof(struct instr *));
}

void
instr_list_insert(struct instr_list *list, struct instr *i)
{
    if(list->n == (list->size - 1)) {
        list->size *= 2;
        list->instr = realloc((void *) list->instr,
                 list->size *sizeof(struct instr *));
    }
    
    list->instr[list->n++] = i;
}

char *
_token(char *token)
{
    if(!token) {
        perror("_token");
        exit(1);
    }

    char *ret = malloc((strlen(token) + 1) * sizeof(char));
    strcpy(ret, token);
    return ret;
}

int
has_label(char *str)
{
    char token[LABELSZ];
    sscanf(str, "%s", token);
    
    if(token[strlen(token) - 1] == ':')
        return 1;
    else    
        return 0;
}

int
is_label(char *str)
{
    if(str[0]>= 'A' && str[0] <= 'z')
        return 1;
    else
        return 0;
}

int
has_opnd(char *op)
{
    /* 1-Operand (Pseudo)Instructions */
    char iop[][4] = {
                        "AND", "ADD", "LDA", "STA",
                        "BUN", "BSA", "ISZ", "ORG",
                        "HEX", "DEC", "CHR"
                    };

    int i;
    for(i = 0; i < sizeof(iop) / sizeof(iop[0]); i++) {
        if(!strcmp(op, iop[i]))
            return 1;
    }
    
    return 0;
}

struct instr *
get_instr(char *str)
{
    struct instr *instr = calloc(1, sizeof(struct instr));
    char *token[4]; 
    
    int flabel = has_label(str);
      
    token[0] = strtok(str, " ");
    token[1] = strtok(NULL, " ");
    token[2] = strtok(NULL, " ");
    token[3] = strtok(NULL, " ");   
    
    if(!token[0]) return 0;
    
    /* Get label if there is any */
    if(flabel) {
        /* Remove the ':' */
        token[0][strlen(token[0]) - 1] = 0;
    
        instr->label = _token(token[0]);
    }

    /* Get operation */
    if(flabel)
        instr->op = _token(token[1]);
    else
        instr->op = _token(token[0]);

    /* Get instruction ID */
    instr->id = get_instr_id(instr->op);
    
    /* Check instruction type */
    instr->mri = has_opnd(instr->op);
    
    /* Get operand if any */
    if(instr->mri && flabel)
        instr->opnd = _token(token[2]);
    else if(instr->mri)
        instr->opnd = _token(token[1]);
    else
        instr->opnd = 0;
        
     /* Check addressing mode */
     instr->indirect = 0;
     if(instr->mri && flabel) {
        if(token[3] && token[3][0] == 'I')
            instr->indirect = 1;
     }
     else if(instr->mri) {
        if(token[2] && token[2][0] == 'I')
            instr->indirect = 1;
     }
     
    return instr;
}

/* Pass 1 - Locate the labels */
void
pass1(struct instr_list *list)
{
    /* Location counter */
    short lc = 0;
    
    int i;
    struct instr *instr;
    
    for(i = 0; i < list->n; i++) {
        instr = list->instr[i];
        
        if(instr->label)
            symtab_add(instr->label, lc);
        
        if(strcmp(instr->op, "ORG"))
            lc++;
        else {
            /* If the instruction is 'ORG', skip as many bytes
               as indicated by the operand */
            short skip;
            sscanf(instr->opnd, "%x", (unsigned int *) &skip);
            lc += skip;
        }
    }
}

#define GEN_INSTR_JMPTABLE(i) \
    case i: \
        instr_bin = codegen_ ## i (instr->opnd, instr->indirect); \
        break;

void
pass2(struct instr_list *list, FILE *fd)
{
    int i;
    struct instr *instr;
    
    for(i = 0; i < list->n; i++) {
        instr = list->instr[i];
        
        /* If operand is label, replace it with the location of the label */
        if(instr->opnd && is_label(instr->opnd)) {
            char *c = malloc(5 * sizeof(char));
            sprintf(c, "%hx", symtab_get(instr->opnd));
            instr->opnd = c;
        }
                     
        short instr_bin;
        switch(instr->id) {
            FOREACH_INSTR(GEN_INSTR_JMPTABLE);
        }
        
        
        if(instr->id != ORG) {          
            if(global_args.raw)
                fprintf(fd, "%hx ", instr_bin);
            else
                fwrite(&instr_bin, 1, 2, fd);
        }
        else {
            int j;
            int zero = 0;
            for(j = 0; j < instr_bin; j++)
                if(global_args.raw)
                    fprintf(fd, "%hx ", 0);
                else
                    fwrite(&zero, 1, 2, fd);
        }
    }
}

int
main(int argc, char *argv[])
{
    int opt = 0;
  
    /* Process the command line parameters */
    opt = getopt(argc, argv, opt_string);
    while(opt != -1) {
        switch(opt) {
            case 'R':
                global_args.raw = 1;
                break;
            
            case 'o':
                global_args.out_file = optarg;
                break;
        }
        opt = getopt(argc, argv, opt_string);
    }
    
    /* The input file name */
    global_args.in_file = argv[optind];
    
    if(!global_args.in_file) {
        printf("No input file!\n");
        exit(0);
    }

    /* Open the input file */
    FILE *fd_in = fopen(global_args.in_file, "r");
    if(!fd_in) {
        perror("Input");
        exit(1);
    }
    
    /* Get file size */
    int fsize;
    struct stat f_stat;
    stat(global_args.in_file, &f_stat);
    fsize = f_stat.st_size;
    
    /* File buffer */
    char *code = malloc((fsize + 1) * sizeof(char));
    
    /* Read the file into the buffer */
    fread(code, sizeof(char), fsize * sizeof(char), fd_in);
    code[fsize] = 0;
 
    /* Open output file */
    FILE *fd_out;
    
    if(global_args.out_file)
        fd_out = fopen(global_args.out_file, "wb");
    else
        fd_out = fopen("a.out", "wb");
    
    /* Print file header if output type is RAW */
    if(global_args.raw)
        fprintf(fd_out, "v2.0 raw\n");
                       
    /* Initialize the symbol table structure */
    symtab_init();
                     
    struct instr_list list;
    instr_list_init(&list);
    
    char *last;
    char *line = strtok_r(code, "\n", &last);

    do {
        if(line[0] != ';') { /* Skip comments */
            struct instr *instr;
            instr = get_instr(line);
            
            if(instr)
                instr_list_insert(&list, instr);
        }
        
        line = strtok_r(NULL, "\n", &last);
    } while(line);


    pass1(&list);   
    pass2(&list, fd_out);
    
    return 0;
}
