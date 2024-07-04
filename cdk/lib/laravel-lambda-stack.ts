import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {ILayerVersion, LayerVersion} from 'aws-cdk-lib/aws-lambda';
import {BaseEnvs, baseEnvs, getServiceName} from "../config/environment";
import {CorsHttpMethod, HttpApi, HttpApiProps} from "aws-cdk-lib/aws-apigatewayv2";
import {HttpMethod, RuleTargetInput, Schedule} from "aws-cdk-lib/aws-events";
import {HttpLambdaIntegration} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class LaravelLambdaStack extends cdk.Stack {
    private readonly envs: BaseEnvs;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Init envs variable
        this.envs = baseEnvs();

        const apiGatewayName = this.getResourceName("Api")
        const apiProps: HttpApiProps = {
            apiName: apiGatewayName,
            description: `API for ${getServiceName()}`,
            corsPreflight: {
                allowOrigins: ["*"],
                allowHeaders: ["*"],
                allowMethods: [CorsHttpMethod.ANY],
            },
        };

        const api = new HttpApi(this, apiGatewayName, apiProps);

        // Deploy lambda for HTTP requests
        const appFunctionName = this.getResourceName("app");
        const appFunction = this.createLambdaFunction({
            lambdaName: appFunctionName,
            handler: "public/index.php", // Set as handler the public/index.php file
            timeout: 20,
            layers: [
                LayerVersion.fromLayerVersionArn(
                    this,
                    "php-82-fpm",
                    "arn:aws:lambda:ap-southeast-2:534081306603:layer:php-82-fpm:70"
                ),
            ],
        });

        // Proxy all the requests to the app function
        ["/", "/{any+}"].forEach((path) => {
            api?.addRoutes({
                path,
                methods: [
                    HttpMethod.GET,
                    HttpMethod.PATCH,
                    HttpMethod.PUT,
                    HttpMethod.DELETE,
                    HttpMethod.OPTIONS,
                ],
                integration: new HttpLambdaIntegration(appFunctionName, appFunction),
            });
        });

        // Configure Laravel Project
        // this.configureLaravelConsole();
    }

    private deployPublicAssets() {
        // S3 bucket for static assets
        const bucketName = this.getResourceName("bucket");
        const bucket = new s3.Bucket(this, bucketName);

        // Deploy static assets to the S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployAssets', {
            sources: [s3deploy.Source.asset('../laravel/public')],
            destinationBucket: bucket,
        });
    }



    private configureLaravelConsole() {
        // Deploy lambda for Artisan
        // const artisanFunctionName = this.getResourceName("Artisan");
        // const artisanFunction = this.createLambdaFunction({
        //     lambdaName: artisanFunctionName,
        //     handler: "artisan-for-lambda.php", // Set artisan-for-lambda.php as handler
        //     timeout: 60,
        //     layers: [
        //         LayerVersion.fromLayerVersionArn(
        //             this,
        //             "php-74",
        //             "arn:aws:lambda:eu-central-1:209497400698:layer:php-74:66"
        //         ),
        //     ],
        // });
        //
        // const cronFunctions = [
        //     {
        //         command: "hello:world",
        //         cron: {
        //             minute: "0",
        //             hour: "0",
        //             day: "*",
        //             month: "*",
        //             year: "*",
        //         },
        //     },
        // ];
        //
        // cronFunctions.forEach(({ cron, command }) => {
        //     new Rule(this, `${artisanFunctionName}-Rule`, {
        //         schedule: Schedule.cron(cron),
        //         targets: [
        //             new LambdaFunction(artisanFunction, {
        //                 event: RuleTargetInput.fromText(command),
        //             }),
        //         ],
        //     });
        // });
    }


    /**
     * Create lambda function
     * @param param0
     * @returns
     */
    private createLambdaFunction({handler, lambdaName, timeout, layers,}: {
        handler: string;
        lambdaName: string;
        timeout: number;
        layers: ILayerVersion[];
    }): lambda.Function {
        return new lambda.Function(this, lambdaName, {
            functionName: lambdaName,
            runtime: lambda.Runtime.PROVIDED_AL2,
            memorySize: 2048,
            code: lambda.Code.fromAsset("build/laravel/"),
            handler,
            timeout: cdk.Duration.seconds(timeout),
            environment: {
                ...this.envs,
            },
            layers,
        });
    }


    private getResourceName(postfix: string): string {
        return `${getServiceName()}-${postfix}`;
    }
}
