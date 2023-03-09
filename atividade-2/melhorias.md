# Melhorias

A organização deste arquivo baseia-se na ideia de apresentar subtítulos com o tópico que está sendo abordado na sugestão e os arquivos citados são referentes ao modelo de código da atividade, caso seja necessária sua consulta.

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

### Arquivo gravacao_continuous.test.ts

Os nomes pelos quais os testes são referidos parecem pouco intuitivos, apesar de claramente seguirem um padrão. Por exemplo, enquanto em `'Recover camera dia'` é possível interpretar que está buscando uma câmera referente a um determinado dia, em `Recover camera` isso não fica tão claro, visto que não é possível compreender qual é a câmera que está sendo buscada. Sendo assim, seria interessante a inclusão de comentários breves que deem alguns detalhes sobre a operação. No geral, alguns comentários poderiam ser adicionados para melhorar a compreensão de alguns trechos do códigos.

## Tratamento de Erros

### Arquivo app.ts

Este arquivo, assim como muitos outros, não apresenta uma forma clara de tratamento de erros, de forma que possíveis entradas ou requisições inválidas prejudicam a execução da aplicação. Sendo assim, uma forma de evitar que isto aconteça seria adicionando um tratamento de erro como o seguinte:

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

Além disso, para fins de testes, também poderiam ser adicionadas mensagens que exibem o estado da aplicação, como para a inicialização do servidor:

```
app.listen(3000, function() {
    console.log('Servidor inicializado com sucesso.');
})
```

## Validação de Dados

### Arquivo validator.js

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

### Arquivo validator.js

A função `createEventObject()`, por exemplo, está criando o novo objeto apenas mediante uma cópia dos valores de req.body. Uma forma de deixá-la mais limpa seria:

```
export function createEventObject(req: any) {
  const { _id, favorited, visualized, link_bucket, timestamp } = req.body;
  const event = { _id, favorited, visualized, link_bucket, timestamp };
  return event;
}
```

## Modularização

### Arquivo \utils\MongoEvents.ts

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

## Conclusão

Desta forma, encerra-se este relatório de sugestão de melhorias. Com a análise do código apresentado, foi possível avaliar trechos que claramente podiam ser melhorados, como o que foi apontado no tópico Modularização, além de tornar-se evidente que uma análise cuidadosa de um código extenso e complexo leva bastante tempo, não apenas para a execução de testes que possibilitem a compreensão de suas funcionalides, como também a partir do entendimento das tecnologias aplicadas. Sendo assim, não é surpreendente imaginar que muitas outras mudanças podem ser propostas não apenas para o código desta atividade, como também para quaisquer outros que tenhamos a oportunidade de analisar.
