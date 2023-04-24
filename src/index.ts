import express, { Request, Response } from 'express'
import cors from 'cors'
import {db} from './database/knex'
import { v4 as uuidv4 } from 'uuid'


const app = express()
app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})


//USERS

//get users
app.get("/users", async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.q as string | undefined;
      if (searchTerm === undefined) {
        const result = await db("users");
        res.status(200).send(result);
      } else {
        const result = await db("users").where("name", "LIKE", `%${searchTerm}%`);
        res.status(200).send(result);
      }
    } catch (error) {
      console.log(error);
  
      if (res.statusCode === 200) {
        res.status(500);
      }
  
      if (error instanceof Error) {
        res.json({ message: error.message });
      } else {
        res.json({ message: "Erro inesperado" });
      }
    }
  });


  

  
//created user
 
app.post('/purchases', async (req, res) => {
    try {
      const { buyer, total_price } = req.body;
      const id = uuidv4();
      await db('purchases').insert({
        id,
        buyer,
        total_price,
        paid: 0
      });

      const newPurchase = await db('purchases').where({ id }).first();
      res.status(201).send(newPurchase);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao criar nova compra');
    }
  });

//delete user 
      app.delete("/users/:id", async (req: Request, res: Response) => {
        const id = req.params.id;
        try {
            const result = await db("users").where({ id }).delete();
            if (result === 0) {
                res.status(404).send("Usuário não encontrado.");
            } else {
                res.status(204).send();
            }
        } catch (error) {
            console.log(error);
            res.status(500).send("Erro ao deletar usuário.");
        }
    });




//PRODUCTS


app.post('/products', async (req, res) => {
    try {
      const { id, name, price, description, image_url } = req.body;
      await db('products').insert({ id, name, price, description, image_url });
      res.status(201).send('Produto criado com sucesso');
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro inesperado");
    }
  });

//Get all products 1
  app.get('/products', async (req, res) => {
    try {
      const products = await db('products').select('*');
      res.status(200).send(products);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro inesperado");
    }
  })
//Get all products 2
app.get('/products/:id', async (req, res) => {
    try {
      const product = await db('products').where({ id: req.params.id }).first();
      if (!product) {
        res.status(404).send('Produto não encontrado');
      } else {
        res.status(200).send(product);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro inesperado");
    }
  });


//Edit product by id

app.put('/products/:id', async (req, res) => {
    try {
      const { name, price, description, image_url } = req.body;
      const product = await db('products').where({ id: req.params.id }).first();
      if (!product) {
        res.status(404).send('Produto não encontrado');
      } else {
        await db('products').where({ id: req.params.id }).update({
          name: name || product.name,
          price: price || product.price,
          description: description || product.description,
          image_url: image_url || product.image_url
        });
        const updatedProduct = await db('products').where({ id: req.params.id }).first();
        res.status(200).send(updatedProduct);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro inesperado");
    }
  });

/*
body example
{
  "name": "New Product Name",
  "price": 29.99,
  "description": "New product description",
  "image_url": "https://example.com/new-product-image.jpg"
}*/




//PURCHASE

//create purchase 

app.post('/purchases', async (req, res) => {
    try {
      const { buyer, total_price } = req.body;
  
      const id = uuidv4();
  
      await db('purchases').insert({
        id,
        buyer,
        total_price,
        paid: 0
      });
  
      // Retornar a nova compra como resposta
      const newPurchase = await db('purchases').where({ id }).first();
      res.status(201).send(newPurchase);
    } catch (error) {
      // Lidar com erros
      console.error(error);
      res.status(500).send('Erro ao criar nova compra');
    }
  });



/*
body example
{
  "buyer": "user-id-here",
  "products": [
    {
      "productId": "product-id-here",
      "quantity": 2
    },
    {
      "productId": "another-product-id-here",
      "quantity": 1
    }
  ]
}*/




//Delete purchase by id
app.delete('/purchases/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Verificar se a compra existe
      const purchase = await db('purchases').where({ id }).first();
      if (!purchase) {
        return res.status(404).send('Compra não encontrada');
      }
  
      // Excluir a compra do banco de dados
      await db('purchases').where({ id }).delete();
  
      // Retornar uma mensagem de sucesso
      res.status(200).send('Compra excluída com sucesso');
    } catch (error) {
      // Lidar com erros
      console.error(error);
      res.status(500).send('Erro ao excluir compra');
    }
  });

//Get purchase by id


app.get('/purchases/:id', async (req, res) => {
    try {
      const { id } = req.params;
        const purchase = await db('purchases').where({ id }).first();
      if (!purchase) {
        return res.status(404).send('Compra não encontrada');
      }
        const products = await db('purchases_products')
        .join('products', 'purchases_products.product_id', '=', 'products.id')
        .where({ purchase_id: id })
        .select('products.*', 'purchases_products.quantity');
        const result = {
        id: purchase.id,
        buyer: purchase.buyer,
        total_price: purchase.total_price,
        created_at: purchase.created_at,
        paid: purchase.paid,
        products
      };

      res.status(200).send(result);
    } catch (error) {

      console.error(error);
      res.status(500).send('Erro ao obter informações da compra');
    }
  });