# Melhorias

A organização deste arquivo baseia-se na ideia de apresentar subtítulos com o tópico que está sendo abordado na sugestão e os arquivos citados estão distribuídos em itens, com links para acessá-los diretamente caso seja necessária sua consulta.

## Vulnerabilidades e Problemas de Segurança

### Pacotes obsoletos
A princípio, com a utilização do comando `npm install`, foi exibida a seguinte informação no terminal:

```bash
36 vulnerabilities (1 low, 19 moderate, 13 high, 3 critical)
```
  
Esta mensagem revelou que muitos dos pacotes utilizados estavam desatualizados ou não tinham mais suporte, logo, a resolução destes problemas de vulnerabilidades como uma primeira etapa faz-se lógica, evitando um possível comprometimento da segurança e integridade da aplicação. Para isto, pode ser usado o comando `npm audit` para receber um relatório com maiores detalhes sobre os pacotes problemáticos e `npm audit fix` para resolvê-los. Entretanto, este comando não foi suficiente para solucionar todos os problemas encontrados, de modo que seria necessária uma análise mais apurada dos causadores das vulnerabilidades para que fossem tratados individualmente de maneira adequada. Todavia, como a versão apresentada do código é antiga, é de se esperar que esse tipo de problema seja solucionado ao longo do tempo, conforme surgir a necessidade.

## Organização de Arquivos

### Pasta raiz

Em uma primeira análise, é possível notar alguns arquivos semelhantes, como `.dockerignore` e `Dockerfile`. Desta forma, pode ser interessante criar uma pasta para armazenar estes dois arquivos e similares que possam vir a ser necessários no futuro (`/dockerFiles`, por exemplo). Contudo, isto implicaria em alterações nas configurações e dependências do código da aplicação e do Docker que refletissem esta mudança, portanto, pode ser mais convenientes deixá-los como estão.

## Comentários e Legibilidade

### Arquivo [gravacao_continuous.test.ts](https://github.com/GuilhermeSGodoy/villainbnb/blob/main/atividade-2/__tests__/gravacao_continuous.test.ts)

Os nomes pelos quais os testes são referidos parecem pouco intuitivos, apesar de claramente seguirem um padrão. Por exemplo, enquanto em `'Recover camera dia'` é possível interpretar que está buscando uma câmera referente a um determinado dia, em `Recover camera` isso não fica tão claro, visto que não é possível compreender qual é a câmera que está sendo buscada. Sendo assim, seria interessante a inclusão de comentários breves que deem alguns detalhes sobre a operação.

## Tratamento de Erros

### Arquivo [app.ts](https://github.com/GuilhermeSGodoy/villainbnb/blob/main/atividade-2/src/app.ts)

Este arquivo, assim como muitos outros, não apresenta nenhuma forma de tratamento de erros, de forma que possíveis entradas ou requisições inválidas prejudicam a execução da aplicação. Sendo assim, uma forma de evitar que isto aconteça seria adicionando um tratamento de erro como o seguinte:

```
app.use(function errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error(err.stack)

  res.status(500).json({
    error: {
      message: err.message,
      stack: err.stack,
    },
  })
})
```

## Validação de Dados

### Arquivo [validator.js](https://github.com/GuilhermeSGodoy/villainbnb/blob/main/atividade-2/src/utils/validator.ts)

Neste caso, pode ser interessante criar algumas validações adicionais para os parâmetros que estão sendo requisitados de `FIELDS`. Por exemplo, a função `createEvent()` poderia se aproveitar de outros métodos do `express-validator`:

```
export function createEvent() {
  return [
    body(FIELDS._ID)
      .exists().withMessage(`${FIELDS._ID} é obrigatório`)
      .isString().withMessage(`${FIELDS._ID} deve ser uma string`)
      .notEmpty().withMessage(`${FIELDS._ID} não pode estar vazio`),
    body(FIELDS.EVENTOS)
      .exists().withMessage(`${FIELDS.EVENTOS} é obrigatório`)
      .isString().withMessage(`${FIELDS.EVENTOS} deve ser uma string`)
      .notEmpty().withMessage(`${FIELDS.EVENTOS} não pode estar vazio`)
  ]
}
```

## Refatoramento de Trechos do Código

### Arquivo [validator.js](https://github.com/GuilhermeSGodoy/villainbnb/blob/main/atividade-2/src/utils/validator.ts)

A função `createEventObject()`, por exemplo, está criando o novo objeto apenas mediante uma cópia dos valores de req.body. Uma forma de deixá-la mais limpa seria:

```
export function createEventObject(req: any) {
  const { _id, favorited, visualized, link_bucket, timestamp } = req.body;
  const event = { _id, favorited, visualized, link_bucket, timestamp };
  return event;
}
```

## Modularização

### Arquivo [MongoEvents.ts](https://github.com/GuilhermeSGodoy/villainbnb/blob/main/atividade-2/src/utils/MongoEvent.ts)

Neste arquivo, podemos verificar que há um trecho que é repetida três vezes, nas funções `queryEvents`, `queryEventsByID` e `countEvents`:

```
{
  $match: query
},
{
  $project: {
    eventos: {
      $filter: {
        input: '$eventos',
        as: 'event',
        cond: { $and: projection }
      }
    }
  }
},
{ $unwind: '$eventos' },
```

Sendo assim, o trecho pode ser transformado em uma função auxiliar que retorna este trecho quando necessário, evitando a repetição:
      
```
async queryEventsPipeline(query: any, projection: any) {
  return [
    {
      $match: query
    },
    {
      $project: {
        eventos: {
          $filter: {
            input: '$eventos',
            as: 'event',
            cond: { $and: projection }
          }
        }
      }
    },
    { $unwind: '$eventos' },
  ];
}
```

De modo que esta função auxiliar poderia ser chamada em `queryEvents()`, por exemplo, da seguinte forma:

```
async queryEvents(query: any, projection: any, skip: number, limit: number, dbName: string, collectionName: string) {
  const pipeline = await this.queryEventsPipeline(query, projection);
  pipeline.push(
    { $sort: { 'eventos.timestamp': 1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $group: {
        _id: '$_id',
        eventos: { $push: '$eventos' }
      }
    }
  );
  return this.loadPipeline(dbName, collectionName, pipeline);
}
```


(SERÁ QUE VAI USAR ISSO AINDA?)
botando um lançamento de erro um pouco mais sofisticado:
export function validateChain(req: any) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return true

  const [error] = errors.array({ onlyFirstError: true });
  const message = `Validation error: ${error.param} ${error.msg}`;
  const status = 400; // Bad Request
  throw { message, status };
}
