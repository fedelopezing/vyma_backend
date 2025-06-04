export const biolimpiezaEmailTemplate = (data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  details?: string;
  message?: string;
  plan?: string;
  question?: string;
  subject?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Consulta Web</title>
        <style>
            body{
                background-color: #f9f9f9;
                font-family: Helvetica, sans-serif;
            }

            .container{
                width: 80%;
                padding: 30px;
                max-width: 600px;
                margin: 20px auto;
                border: 1px solid #cecece;
                border-top: 10px solid #008f2f;
                border-radius: 10px;
            }
            .row{
            }

            .cabecera{
                text-align: center;
            }

            .cabecera h2{
                color     : #008f2f;
                margin-top: 0;
                margin-bottom: 25px;
            }

            .cabecera h3{
                color        : #6d6c6c;
                margin-top   : 15px;
                margin-bottom: 5px;
                font-size: 14px;
            }

            .cabecera img{
                height: 40px;
            }

            .list-group{
                background-color: #ecebeb; 
                border-radius: 10px;
                padding: 25px;
            }

            .list-group-item{
                list-style: none;
                color: #7d7d7d;
                padding-top: 10px;
            }

            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666666;
            }

            @media screen and (max-width: 425px) {
                .container{
                    width: 90%;
                    padding: 10px;
                }
                .cabecera{
                    flex-direction: column-reverse;
                    align-items: center;
                }
                ul{
                    padding: 15px;
                    margin:0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <div class="cabecera">
                    <img src="https://www.biolimpieza.com.py/views/img/logo.png" alt="logo de biolimpieza">
                    <h3>HAS RECIBIDO UNA CONSULTA DE</h3>
                    <h2>${data.subject || 'Nueva Consulta'}</h2>
                </div>
                <ul class="list-group">
                    <li class="list-group-item"><strong>Nombre:</strong> ${data.name}</li>
                    <li class="list-group-item"><strong>Email:</strong> ${data.email}</li>
                    ${data.phone ? `<li class="list-group-item"><strong>Numero:</strong> ${data.phone}</li>` : ''}
                    ${data.city ? `<li class="list-group-item"><strong>Ciudad:</strong> ${data.city}</li>` : ''}
                    ${data.address ? `<li class="list-group-item"><strong>Dirección:</strong> ${data.address}</li>` : ''}
                    ${data.details ? `<li class="list-group-item"><strong>Detalle:</strong> ${data.details}</li>` : ''}
                    ${data.message ? `<li class="list-group-item"><strong>Mensaje:</strong> ${data.message}</li>` : ''}
                    ${data.plan ? `<li class="list-group-item"><strong>Plan:</strong> ${data.plan}</li>` : ''}
                    ${data.question ? `<li class="list-group-item"><strong>Consulta:</strong> ${data.question}</li>` : ''}
                </ul>
                <div class="footer">
                    <p>Este es un correo automático, por favor no responda directamente a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} Biolimpieza. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
