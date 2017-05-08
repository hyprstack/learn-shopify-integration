# learn-shopify-integration

##Shopify Ecommerce Integration with Express.js, AWS API-Gateway, Cloudformation and mySQL

#### Breakdown of the project

- The `Express.js` app will contain a login page (using oauth2) and a import form for the `Shopify` shop details.
This form will require the name of the `Shopify` shop.
Once the user has submitted this information, the app will then log-in to `Shopify` and store the returned credentials for later use.
- `Webhooks` will be generated to automate any product updates, deletions, creations or app removals.
- You will be able to check your downloaded products using the endpoint we will create.
- AWS will be used to leverage the power of `API-GATEWAY` and I will show you how to develop and run a fully
scalable app on api-gateway without having to worry about defining each and every response on AWS; all it will take is one
configuration file and everything else will be developed as if it were a simple Express app on its own. 

**Note**: All the code and structure of the project is available at */integration* in this repository

#### What are Webhooks?

`A WebHook is an HTTP callback: an HTTP POST that occurs when something happens;
a simple event-notification via HTTP POST. A web application implementing WebHooks 
will POST a message to a URL when certain things happen.`

Read more about webhooks [here](https://en.wikipedia.org/wiki/Webhook).

#### api-gateway

AWS Api-Gateway was designed to create exactly what the names indicates, by leveraging the power of `AWS Lambda` and `AWS Cloudfront` - API's. However
it comes with a high learning curve and a lot of work the larger the API grows. Even if you are familiar with 
`swagger` or `yaml` configuration files, defining your api can still be very time consuming and equally frustrating.
Unless you think manually setting each request and response object is fun, the way I will show is way cooler, thanks to
[aws-serverles-express](https://github.com/awslabs/aws-serverless-express) and a tutorial you can follow [here](https://medium.com/@hyprstack/porting-expressjs-apis-onto-aws-api-gateway-12161c8c0635).

To use the best of both worlds we will require a simple configuration file which will use the awesome
proxy path on api-gateway. This is a sorts of wild card for paths, allowing you to pass in any request object to your app 
on the backend and dealing with it there.


```yaml
    ---
    swagger: 2.0
    info:
      title: ExpressAPI
    basePath: /YOUR_API_GATEWAY_STAGE
    schemes:
    - https
    paths:
      /:
        x-amazon-apigateway-any-method:
          produces:
          - application/json
          responses:
            200:
              description: 200 response
              schema:
                $ref: "#/definitions/Empty"
          x-amazon-apigateway-integration:
            responses:
              default:
                statusCode: 200
            uri: arn:aws:apigateway:YOUR_AWS_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:YOUR_AWS_REGION:YOUR_ACCOUNT_ID:function:YOUR_LAMBDA_FUNCTION_NAME/invocations
            passthroughBehavior: when_no_match
            httpMethod: POST
            type: aws_proxy
        options:
          consumes:
          - application/json
          produces:
          - application/json
          responses:
            200:
              description: 200 response
              schema:
                $ref: "#/definitions/Empty"
              headers:
                Access-Control-Allow-Origin:
                  type: string
                Access-Control-Allow-Methods:
                  type: string
                Access-Control-Allow-Headers:
                  type: string
          x-amazon-apigateway-integration:
            responses:
              default:
                statusCode: 200
                responseParameters:
                  method.response.header.Access-Control-Allow-Methods: "'GET,OPTIONS,POST,PATCH,DELETE'"
                  method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
                  method.response.header.Access-Control-Allow-Origin: "'*'"
            passthroughBehavior: when_no_match
            requestTemplates:
              application/json: "{\"statusCode\": 200}"
            type: mock
      /{proxy+}:
        x-amazon-apigateway-any-method:
          produces:
          - application/json
          parameters:
          - name: proxy
            in: path
            required: true
            type: string
          responses: {}
          x-amazon-apigateway-integration:
            uri: arn:aws:apigateway:YOUR_AWS_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:YOUR_AWS_REGION:YOUR_ACCOUNT_ID:function:YOUR_LAMBDA_FUNCTION_NAME/invocations
            httpMethod: POST
            type: aws_proxy
        options:
          consumes:
          - application/json
          produces:
          - application/json
          responses:
            200:
              description: 200 response
              schema:
                $ref: "#/definitions/Empty"
              headers:
                Access-Control-Allow-Origin:
                  type: string
                Access-Control-Allow-Methods:
                  type: string
                Access-Control-Allow-Headers:
                  type: string
          x-amazon-apigateway-integration:
            responses:
              default:
                statusCode: 200
                responseParameters:
                  method.response.header.Access-Control-Allow-Methods: "'GET,OPTIONS,POST,PATCH,DELETE'"
                  method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
                  method.response.header.Access-Control-Allow-Origin: "'*'"
            passthroughBehavior: when_no_match
            requestTemplates:
              application/json: "{\"statusCode\": 200}"
            type: mock
    definitions:
      Empty:
        type: object
        title: Empty Schema
```

As you can see there are properties in the file which contain placeholders. I have done this purposefully to allow you to re-use this file for multiple
projects, however feel free to hard-code the values if you know you will only use it once. By running a simple node script replacing those values with your desired ones.
Such a script could look like this

```javascript
    #!/usr/bin/env node
    'use strict';
    const fs = require('fs');
    const exec = require('child_process').exec;
    const args = process.argv.slice(2);
    const accountId = args[0];
    const bucketName = args[1];
    const region = args[2] || 'us-east-1';
    const apiGatewayStage = args[3] || 'test-stage';
    const lambdafunctionName = args[4] || 'api-lambda-function';
    const availableRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2'];
    
    if (!accountId || accountId.length !== 12) {
      console.error('You must supply a 12 digit account id as the first argument');
      return;
    }
    
    if (!bucketName) {
      console.error('You must supply a bucket name as the second argument');
      return;
    }
    
    if (availableRegions.indexOf(region) === -1) {
      console.error(`Amazon API Gateway and Lambda are not available in the ${region} region. Available regions: us-east-1, us-west-2, eu-west-1, eu-central-1, ap-northeast-1, ap-northeast-2, ap-southeast-1, ap-southeast-2`);
      return;
    }
    
    modifySimpleProxyFile();
    
    function modifySimpleProxyFile() {
      const simpleProxyApiPath = './simple-proxy-api.yaml';
      const simpleProxyApi = fs.readFileSync(simpleProxyApiPath, 'utf8');
      const simpleProxyApiModified = simpleProxyApi
        .replace(/YOUR_ACCOUNT_ID/g, accountId)
        .replace(/YOUR_AWS_REGION/g, region)
        .replace(/YOUR_API_GATEWAY_STAGE/g, apiGatewayStage)
        .replace(/YOUR_LAMBDA_FUNCTION_NAME/g, lambdafunctionName);
    
      fs.writeFileSync(simpleProxyApiPath, simpleProxyApiModified, 'utf8');
    }
```

For more on [api-gateway](https://aws.amazon.com/api-gateway/)!