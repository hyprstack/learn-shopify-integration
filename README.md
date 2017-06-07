# learn-shopify-integration

## Shopify Ecommerce Integration with Express.js, AWS API-Gateway, Cloudformation and mySQL

#### Breakdown of the project

- The `Express.js` app will contain a login page (using oauth2) and an import form for the `Shopify` shop details.
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

*api-gateway.yaml*
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
Such a script could look like this:

*configure.js*
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

#### cloudformation

`Cloudformation` is awesome if you know how to use it. The documentation can be a little challenging at times when it comes to defining and linking resources
 (resources are the tools you will create, i.e. Lambda functions, SQS queues, SNS events, ECS containers, IAM roles, etc.).
 In short, what `cloudformation` allows you to do is create a stack of resources for any given project and even link resources from various
 projects together (although this feature is a little more complex and I won't cover it in this tutorial). Having this stack is useful in management terms,
 as it allows you do safely create, alter and delete all of or individual resources all in one place. This speeds up dev time dramatically once 
 you master the configuration file.
 `Cloudformation` requires that you use s3 to store your lambda code in a bucket. It will use it to fetch the code and load it into `lambda`.
 Breath easily though. It's not as complicated as I make it sound :)
 
 Take this file as an example:
 
*cloudforamtion.json* 
 ```javascript
    {
      "AWSTemplateFormatVersion": "2010-09-09",
      "Description": "YOUR_API_DESCRIPTION",
      "Parameters": {
        "s3BucketName": {
          "Type": "String",
          "Description": "The S3 bucket in which the lambda function code is stored. Bucket names are region-unique, so you must change this."
        },
        "LambdaFunctionS3Key": {
          "Type": "String",
          "AllowedPattern": ".*\\.zip",
          "Description": "The S3 object for the lambda function code package.",
          "Default": "lambda-function.zip"
        },
        "ApiGatewaySwaggerS3Key": {
          "Type": "String",
          "AllowedPattern": ".*\\.yaml",
          "Description": "The S3 object for the swagger definition of the API Gateway API.",
          "Default": "simple-proxy-api.yaml"
        }
      },
    
      "Resources": {
        "ApiGatewayApi": {
          "Type": "AWS::ApiGateway::RestApi",
          "Properties": {
            "Description": "YOUR_API_DESCRIPTION",
            "BodyS3Location": {
              "Bucket": {
                "Ref": "s3BucketName"
              },
              "Key": {
                "Ref": "ApiGatewaySwaggerS3Key"
              }
            }
          }
        },
    
        "ApiGatewayApiDeployment": {
          "Type": "AWS::ApiGateway::Deployment",
          "Properties": {
            "RestApiId": {
              "Ref": "ApiGatewayApi"
            },
            "StageName": "YOUR_API_GATEWAY_STAGE"
          }
        },
    
        "LambdaApiGatewayExecutionPermission": {
          "Type": "AWS::Lambda::Permission",
          "Properties": {
            "Action": "lambda:InvokeFunction",
            "FunctionName": {
              "Fn::GetAtt": ["LambdaFunction", "Arn"]
            },
            "Principal": "apigateway.amazonaws.com",
            "SourceArn": {
              "Fn::Join": ["", ["arn:aws:execute-api:", {
                "Ref": "AWS::Region"
              }, ":", {
                "Ref": "AWS::AccountId"
              }, ":", {
                "Ref": "ApiGatewayApi"
              }, "/*/*"]]
            }
          }
        },
    
        "LambdaFunction": {
          "Type": "AWS::Lambda::Function",
          "Properties": {
            "Code": {
              "S3Bucket": {
                "Ref": "s3BucketName"
              },
              "S3Key": {
                "Ref": "LambdaFunctionS3Key"
              }
            },
            "FunctionName": "YOUR_LAMBDA_FUNCTION_NAME",
            "Handler": "lambda.handlerFunction",
            "Description": "Api running on api-gateway",
            "MemorySize": 128,
            "Role": {
              "Fn::Join": ["", ["arn:aws:iam::", {
                "Ref": "AWS::AccountId"
              }, ":role/test-iam-role"]]
            },
            "Runtime": "nodejs4.3",
            "Timeout": 60
          }
        }
      },
    
      "Outputs": {
        "LambdaFunctionConsoleUrl": {
          "Description": "Console URL for the Lambda Function.",
          "Value": {
            "Fn::Join": ["", ["https://", {
              "Ref": "AWS::Region"
            }, ".console.aws.amazon.com/lambda/home?region=", {
              "Ref": "AWS::Region"
            }, "#/functions/", {
              "Ref": "LambdaFunction"
            }]]
          }
        },
        "ApiGatewayApiConsoleUrl": {
          "Description": "Console URL for the API Gateway API's Stage.",
          "Value": {
            "Fn::Join": ["", ["https://", {
              "Ref": "AWS::Region"
            }, ".console.aws.amazon.com/apigateway/home?region=", {
              "Ref": "AWS::Region"
            }, "#/apis/", {
              "Ref": "ApiGatewayApi"
            }, "/stages/YOUR_API_GATEWAY_STAGE"]]
          }
        }
      }
    }
```

**NOTE:** If you're linking resources from various projects, these would be accessed in the *Outputs* property.

This file is creating an API on `api-gateway` (*ApiGatewayApi* resource), defining the `lambda` function (*LambdaFunction* resource) it will use and setting the permissions (*LambdaApiGatewayExecutionPermission* resource) to run the `lambda` function.
Pretty straight forward. Compare the build time and effort it would take to build it manually, one resource at a time!

More on Cloudformation [here](https://aws.amazon.com/cloudformation/). Resource types [here](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html).

**What resources will we need to add to `cloudformation` for our project?**

1. Our `API` description on `api-gateway`
2. The `lambda` function `api-gateway` will use
3. `RDS` instance for our mySQL database and tables (for simplicity reasons will be public facing, but should be set-up behind a `VPC`(Virtual Private Cloud) and cut-off from internet access)


The `S3 bucket` to store our code and allow `cloudformation` to access it will be created manually. You can create `S3 buckets` using cloudformation,
but they would be empty when you run the `create-stack` command for `cloudformation`.

We will use the build power of our `package.json` file to run the whole set of commands. Learning to leverage to power of `package.json` is useful.


#### Leveraging package.json

`npm` and `package.json` are powerful and awesome tools to use in any build process. A lot of people resort to the likes of `grunt` because they think
they need it to accomplish things they did not know were possible with `npm`. My main gripe with grunt, although I have used it a lot in the past,
 was the poor and at times complicated documentation in their third party modules. Also it is another layer of complexity and just something else you need
 to maintain and keep up to date. Since I started using `npm` in conjunction with the odd `node` script I have managed to rid my build processes of 
 `grunt` altogether.
 
A useful resource on how to use `npm` and `package.json` as a build tool can be found [here](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).

Particular properties to look out for when using `package.json` are the *config* and *scripts* properties.
*config* lets you set parameters accessible from the *scripts* property and the various commands you can define there.
*scripts* lets you run command line commands to passing variables from the *config* property. You access these values with `$npm_package_config_<paramName>`

A fairly simple example is as follows:

*package.json*
```javascript
    {
      "name": "test-project",
      "version": "1.0.0",
      "description": "Project to import products from Shopify",
      "main": "lambda.js",
      "config": {
        "region": "YOUR_AWS_REGION",
        "s3BucketName": "YOUR_UNIQUE_BUCKET_NAME",
        "cloudFormationStackName": "test-stack",
        "dbzone": "YOUR_UNIQUE_DB_ZONE",
        "dbInstanceClass": "YOUR_UNIQUE_INSTANCE",
        "dbName": "YOUR_UNIQUE_DB_NAME",
        "masterDbUser": "YOUR_UNIQUE_USER_NAME",
        "masterDbPass": "YOUR_UNIQUE_PASS",
        "dbVpcGroups": "YOUR_UNIQUE_VPC"
      },
      "scripts": {
        "config": "node configure.js",
        "create-bucket": "aws s3 mb s3://$npm_package_config_s3BucketName --region $npm_package_config_region",
        "package-function": "zip -q -r lambda-function.zip lib/ node_modules/ lambda.js config.json",
        "upload-function": "aws s3 cp ./lambda-function.zip s3://$npm_package_config_s3BucketName --region $npm_package_config_region",
        "create-stack": "aws cloudformation create-stack --stack-name $npm_package_config_cloudFormationStackName --template-body file://./cloudformation.json --capabilities CAPABILITY_IAM --parameters ParameterKey=HevnlifyCommonBucket,ParameterValue=$npm_package_config_s3BucketName ParameterKey=MSQLAvailabilityZone,ParameterValue=$npm_package_config_dbzone ParameterKey=MSQLDBInstanceClass,ParameterValue=$npm_package_config_dbInstanceClass ParameterKey=MSQLDBName,ParameterValue=$npm_package_config_dbName ParameterKey=MSQLMasterName,ParameterValue=$npm_package_config_masterDbUser ParameterKey=MSQLMasterPassword,ParameterValue=$npm_package_config_masterDbPass ParameterKey=MSQLVCPSecurityGroups,ParameterValue=$npm_package_config_dbVpcGroups --region $npm_package_config_region",
        "update-stack": "aws cloudformation update-stack --stack-name $npm_package_config_cloudFormationStackName --template-body file://./cloudformation.json --capabilities CAPABILITY_IAM --parameters ParameterKey=HevnlifyCommonBucket,ParameterValue=$npm_package_config_s3BucketName ParameterKey=MSQLAvailabilityZone,ParameterValue=$npm_package_config_dbzone ParameterKey=MSQLDBInstanceClass,ParameterValue=$npm_package_config_dbInstanceClass ParameterKey=MSQLDBName,ParameterValue=$npm_package_config_dbName ParameterKey=MSQLMasterName,ParameterValue=$npm_package_config_masterDbUser ParameterKey=MSQLMasterPassword,ParameterValue=$npm_package_config_masterDbPass ParameterKey=MSQLVCPSecurityGroups,ParameterValue=$npm_package_config_dbVpcGroups --region $npm_package_config_region",
        "delete-stack": "aws cloudformation delete-stack --stack-name $npm_package_config_cloudFormationStackName --region $npm_package_config_region",
        "package-upload-function": "npm run package-function && npm run upload-function",
        "upload-update-function": "npm run upload-function && npm run update-function",
        "package-upload-update-function": "npm run package-upload-function && npm run update-function",
        "set-up-dynamo-tables": "",
        "setup": "npm install && (aws s3api get-bucket-location --bucket $npm_package_config_s3BucketName --region $npm_package_config_region || npm run create-bucket) && (npm run package-upload-update-function || npm run package-upload-function) && (npm run update-stack || npm run create-stack || echo 'Nothing to update on Cloudformation stack')"
      },
      "repository": {
        "type": "git",
        "url": "<gitHubUrl>"
      },
      "author": "Mario Mendes",
      "license": "ISC",
      "dependencies": {}
    }
```

And you could change *configure.js* to manipulate the `package.json` file to replace all the placeholders, such as:

```javascript
    #!/usr/bin/env node
    'use strict';
    const fs = require('fs');
    const args = process.argv.slice(2);
    const accountId = args[0];
    const bucketName = args[1];
    const region = args[2] || 'us-east-1';
    const availableRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2'];
    const dbzone = args[3];
    const dbinstance = args[4];
    const dbname = args[5];
    const username = args[6];
    const pass = args[7];
    const vpc = args[8];
    
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
    
    modifyPackageFile();
    // modifyCloudformationFile();
    
    function modifyPackageFile() {
      const packageJsonPath = './package.json';
      const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJsonModified = packageJson
        .replace(/YOUR_UNIQUE_BUCKET_NAME/g, bucketName)
        .replace(/YOUR_AWS_REGION/g, region)
        .replace(/YOUR_UNIQUE_DB_ZONE/g, dbzone)
        .replace(/YOUR_UNIQUE_INSTANCE/g, dbinstance)
        .replace(/YOUR_UNIQUE_DB_NAME/g, dbname)
        .replace(/YOUR_UNIQUE_USER_NAME/g, username)
        .replace(/YOUR_UNIQUE_PASS/g, pass)
        .replace(/YOUR_UNIQUE_VPC/g, vpc);
    
      fs.writeFileSync(packageJsonPath, packageJsonModified, 'utf8');
    }
```

There are two more configuration files I find pretty useful for the integration tool, especially because, one, we will be using `nconf` an npm module
which allows you to define configuration properties in an hierarchical fashion and our own module which allows us to pass named command line parameter
when running the script, `write-config.js`.

#### nconf

I have used this module in most of the projects I have written. It is highly useful and allows you to set configuration object for different build platforms
for example and in hierarchical order.

Lets take the following file as our working example.

*nconfig.js*
```javascript
    'use strict';
    
    var nconf = require('nconf');
    // This is the order of preference
    
    // 2. `process.env`
    // 3. `process.argv`
    nconf.env().argv();
    
    // Values in `config.json`
    nconf.file('./config.json');
    
    //Any default values
    nconf.defaults({
      'AWS_REGION': 'eu-west-1',
      'BASE_URL': 'http://localhost:3000',
      'COOKIE_PARSER_SECRET': 'mysuperawesometestlongsecret44',
      'SESSION_COOKIE': 'dev_session',
      'OAUTH2_SERVER_CLIENT_ID': '',
      'OAUTH2_SERVER_CLIENT_SECRET': '',
      'SHOPIFY_CLIENT_ID': '',
      'SHOPIFY_CLIENT_SECRET': '',
      'SHOPIFY_REDIRECT_URL': '/handle-o-auth-response',
      'SHOPIFY_WEBHOOK_UNINSTALL_URL': '/shopify-app-uninstall',
      'TABLE_PREFIX': 'dev',
      'STORAGE_SERVICE': 'mysql',
      'QUEUE_SERVICE': 'aws-sqs',
      'NOTIFICATION_SERVICE': 'aws-sns',
      "STORAGE_CONFIG": {
          "host"     : "localhost",
          "user"     : "root",
          "password" : "555everythingis555",
          "name" : "learn_shopify_test",
          "charset"  : "utf8"
        }
    });
    
    module.exports = nconf;
```

Breaking down the file, we have set our default values that we will need to authenticate with other services like AWS and mySQL. If we create a file in the
root directory named `config.json` that file will override any default values that you define in the json file. If you define `process.argv` when you run
 the application these value will take precedence over the json file and last `process.env` will take precedence over all other defined values.
 
 Using `nconf` if in its most basic form, which is fetching the values set in our config file from withing our code, requires that you import your `nconfig.js` into your module
 and then use the `get` method to retrieve its value.
 
```javascript
    var config = require('./path/to/nconfig');
    var myAwsRegion = config.get('AWS_REGION'); // 'eu-west-1'
```

You can also set values by using the `set` method.

That's all great, but what if you have for example various build environments?
You need a specific configuration file.

I have found the following useful:

*write-config.js*
```javascript
    /**
     * Created by mario (https://github.com/hyprstack) on 11/10/2016.
     */
    'use strict';
    
    var fs = require('fs');
    
    function objectifyCommandLineArgs(array) {
      //remove the first 2 elements from the array
      array.splice(0, 2);
      // loop through array and form objects
      var i,
        length = array.length,
        finalObj = {};
    
        for(i=0; i < length; i++) {
          var splitStringArray = array[i].split(':');
          // if split string has length greater than 2 we need to join the indexes from 2 forwards
          if (splitStringArray.length > 2) {
            //join items from index 2 forward
            var arrayFrom2 = splitStringArray.splice(1);
            var completeString = arrayFrom2.join(':');
            splitStringArray.push(completeString);
          }
          finalObj[splitStringArray[0]] = splitStringArray[1];
        }
        return finalObj;
    }
    (function() {
      var objOfArgs = objectifyCommandLineArgs(process.argv);
    
      var jsonParams = {
        "AWS_REGION": objOfArgs.awsRegion,
        "OAUTH2_SERVER_CLIENT_ID": objOfArgs.oauthServerClientId,
        "OAUTH2_SERVER_CLIENT_SECRET": objOfArgs.oauthServerClientSecret,
        "SHOPIFY_CLIENT_ID": objOfArgs.shopifyClientId,
        "SHOPIFY_CLIENT_SECRET": objOfArgs.shopifyClientSecret,
        "TABLE_PREFIX": objOfArgs.tablePrefix,
        "SESSION_COOKIE": objOfArgs.SCookieName
      };
    
      jsonParams = JSON.stringify(jsonParams);
    
      fs.writeFile('config.json', jsonParams, function (err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        console.log('Written config.json');
        process.exit(0);
      })
    }());
```

You would use the script by running:

`node write-config.js <property_name>:<property_value>`

So

`node write-config.js awsRegion:us-west-1 oauthServerClientId:12345 oauthServerClientSecret:678900 shopifyClientId:shopifyId shopifyClientId:sfdsfsdf tablePrefix:live SCookieName:live_cookie`


TODO: Exchange mySQL for SQLite - no need for server based database for this example
