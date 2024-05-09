class Carrito {
  constructor() {
 //Se fija si hay algo en carrito de local storage, sino, creo array vacio (Utilizo el operador OR)
      this.articulos = JSON.parse(localStorage.getItem('carrito')) || []; 
      //Actualizo  el display del carrito
      this.actualizarCarritoDisplay();
      //Muestro el carrito cargado de memoria o el vacio sino hay productos.
      this.mostrarCarrito();
  }

  agregarArticuloCarrito(articulo) {
    //Agrego articulo al array de articulos
      this.articulos.push(articulo);
      //guardo el carrito en localstorage.
      this.guardarCarrito();
      //agrego refresco de vistas de datos carrito y carrito al guardar.
  }

  eliminarArticuloCarritoPorId(articuloId) {
    //Busco el indice del articulo a eliminar con su ID y lo elimino del array.
      const index = this.articulos.findIndex(art => art.id === articuloId);
      if (index !== -1) {
          this.articulos.splice(index, 1);
          this.guardarCarrito();
      }
  }

  limpiarCarrito() {
    //llamo un sweetalert para confirmar si borramos el carrito
      Swal.fire({
          title: '¿Estás seguro?',
          text: "No podrás revertir esto y se perderán todos los productos del carrito.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, borrar todo',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
            //Si se confirma el borrado, limpio el array de articulos y guardo el carrito.
              this.articulos = [];
              this.guardarCarrito();
              //Disparo otro sweet alert con la confirmacion.
              Swal.fire(
                  '¡Borrado!',
                  'Tu carrito ha sido limpiado.',
                  'success'
              );
          }
      });
  }

  guardarCarrito() {
      localStorage.setItem('carrito', JSON.stringify(this.articulos));
      this.actualizarCarritoDisplay();
      this.mostrarCarrito();
  }

  actualizarCarritoDisplay() {
    //Actualiza la informacion de la cantidad de articulos y el total del carrito en el nav.
      const carritoCantidad = document.querySelector('#cantidadArticulos');
      const carritoTotal = document.querySelector('#totalCarrito');
      carritoCantidad.innerText = `Artículos: ${this.articulos.length}`;
      //Calculo el total del carrito con reduce y lo muestro en el nav.
      carritoTotal.innerText = `Total: $${this.articulos.reduce((total, articulo) => total + articulo.price, 0)}`;
  }

  mostrarCarrito() {
      const contenedor = document.querySelector('#seccionCarrito .card-container');
      //Limpio el contenedor para que no se dupliquen los articulos.
      contenedor.innerHTML = '';
      this.articulos.forEach(articulo => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
              <img src="${articulo.thumbnail}" alt="${articulo.title}">
              <h3>${articulo.title}</h3>
              <p>Precio: $${articulo.price}</p>
              <button class="remove-btn" data-id="${articulo.id}">Quitar del carrito</button>
          `;
          //Importante agregarle el articulo.ID al boton para poder luego eliminarlo.
          contenedor.appendChild(card);
      });
      const removeButtons = document.querySelectorAll('.remove-btn');
      removeButtons.forEach(button => button.addEventListener('click', (e) => {
            //PONER el PARSE INT, sino te devuelve el id como un string!
          this.eliminarArticuloCarritoPorId(parseInt(e.target.dataset.id));
      }));
  }
}

const carrito = new Carrito();

document.addEventListener('DOMContentLoaded', ()=> {
    //Cargo los productos de las distintas fuentes, las primeras dos son de api y la tercera de un json local.
  cargarProductos("https://dummyjson.com/products/category/smartphones", "seccion1");
  cargarProductos("https://dummyjson.com/products/category/laptops", "seccion2");
  cargarProductos("./productos.json", "seccion3");
  //Agrego los event listeners para bones de limpiar carrito y finalizar compra.
  document.querySelector("#boton-limpiar-carrito").addEventListener('click', () => carrito.limpiarCarrito());
  document.querySelector("#boton-finalizar-compra").addEventListener('click', finalizarCompra);
});

 async function cargarProductos(url, seccionId) {
    //Traigo los datos y genero las cards de los productos con la data obtenida para seccion.
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Tenemos un error con la obtencion de los datos: ${response.status}`);
        } 
        const data = await response.json();
        generarCards(data.products, seccionId);
    }
    catch(error){
        console.error("Error al cargar los productos :",error);
    }

}

function generarCards(productos, seccionId) {
  const contenedor = document.querySelector(`#${seccionId} .card-container`);
  productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
          <img src="${producto.thumbnail}" alt="${producto.title}">
          <h3>${producto.title}</h3>
          <p>Precio: $${producto.price}</p>
          <button onclick="carrito.agregarArticuloCarrito({
              id: ${producto.id},
              title: '${producto.title}',
              price: ${producto.price},
              thumbnail: '${producto.thumbnail}'
          })">Agregar al carrito</button>
      `;
      contenedor.appendChild(card);
  });
}

function finalizarCompra() {
    //Verifico si hay articulos en el carrito.
  if (carrito.articulos.length > 0) {
    //si hay, procedo con la confirmacion.
      Swal.fire({
          title: 'Finalizar compra',
          text: "¿Deseas proceder con el pago?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, proceder',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
        //si se confirma, disparo la confirmacion.
          if (result.isConfirmed) {
              Swal.fire(
                  'Compra realizada',
                  'Tu compra ha sido exitosa. Gracias por comprar con nosotros.',
                  'success'
              );
              //Limpio el carrito luego de la compra.
              carrito.articulos = [];
              carrito.guardarCarrito();
          }
      });
  } else {
      Swal.fire({
          title: 'Carrito vacío',
          text: 'No hay productos en el carrito para comprar.',
          icon: 'info'
      });
  }
}
