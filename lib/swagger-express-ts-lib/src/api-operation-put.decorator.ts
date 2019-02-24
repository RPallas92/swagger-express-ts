import { SwaggerService } from './swagger.service';
import { IApiOperationArgsBase } from './i-api-operation-args.base';
import { addModel } from './model-generator';
export interface IApiOperationPutArgs extends IApiOperationArgsBase {}

export function ApiOperationPut(args: IApiOperationPutArgs): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        addModel(args);
        SwaggerService.getInstance().addOperationPut(args, target, propertyKey);
    };
}
