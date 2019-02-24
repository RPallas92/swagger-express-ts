import { SwaggerService } from './swagger.service';
import { IApiOperationArgsBase } from './i-api-operation-args.base';
import { addModel } from './model-generator';
export interface IApiOperationPostArgs extends IApiOperationArgsBase {}

export function ApiOperationPost(args: IApiOperationPostArgs): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        addModel(args);
        SwaggerService.getInstance().addOperationPost(
            args,
            target,
            propertyKey
        );
    };
}
