const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const url = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = "ocean_bancodedados_13_05_2022";

async function main() {
  console.log("Conectando com o banco de dados...");

  const client = await MongoClient.connect(url);

  const db = client.db(dbName);

  const collection = db.collection("herois");

  console.log("Conexão com o banco de dados realizada com sucesso.");

  const app = express();

  // Indica para o Express que estamos utilizando JSON na requisições
  app.use(express.json());

  // Criação do endpoint principal
  app.get("/", function (req, res) {
    res.send("Hello World");
  });

  // Heróis e Heroínas

  const herois = ["Mulher Maravilha", "Capitã Marvel", "Homem de Ferro"];
  //               0                    1               2

  // Read All (Ler todos os itens)
  app.get("/herois", async function (req, res) {
    const documentos = await collection.find().toArray();

    res.send(documentos);
  });

  // Read by ID (Visualizar um item pelo ID)
  app.get("/herois/:id", async function (req, res) {
    // Recebemos o ID que iremos buscar
    const id = req.params.id;

    // Buscamos o item dentro da lista, utilizando o ID
    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item não encontrado.");

      // Encerra a função
      return;
    }

    res.send(item);
  });

  // Create (Criar um item)
  app.post("/herois", async function (req, res) {
    // Obtemos o nome que foi enviado no body da requisição
    const item = req.body;

    if (!item) {
      res
        .status(400)
        .send(
          "Você deve informar a propriedade 'nome' no corpo da requisição."
        );

      // Encerra a função
      return;
    }

    // Adicionamos esse item obtido dentro da lista de heróis
    await collection.insertOne(item);

    res.send(item);
  });

  // Update (Editar um item)
  app.put("/herois/:id", async function (req, res) {
    // Obtemos o ID do item a ser atualizado
    const id = req.params.id;

    const itemEncontrado = await collection.findOne({ _id: new ObjectId(id) });

    if (!itemEncontrado) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item não encontrado.");

      // Encerra a função
      return;
    }

    // Pegamos a nova informação que está sendo enviada
    const item = req.body;

    // Atualizamos a informação no DB
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: item,
      }
    );

    res.send(item);
  });

  // Delete (Remover um item)
  app.delete("/herois/:id", async function (req, res) {
    // Obtemos o ID do registro que será excluído
    const id = req.params.id;

    const itemEncontrado = await collection.findOne({ _id: new ObjectId(id) });

    if (!itemEncontrado) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item não encontrado.");

      // Encerra a função
      return;
    }

    // Removemos o item do DB
    await collection.deleteOne({ _id: new ObjectId(id) });

    res.send("Item removido com sucesso!");
  });

  app.listen(process.env.PORT || 3000, () =>
    console.log("Aplicação rodando em http://localhost:3000")
  );
}

main();
