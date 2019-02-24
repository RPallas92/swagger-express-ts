import { SwaggerService } from './swagger.service';
import { IApiOperationArgsBase } from './i-api-operation-args.base';
import { addModel } from './model-generator';
export interface IApiOperationGetArgs extends IApiOperationArgsBase {}

export function ApiOperationGet(args: IApiOperationGetArgs): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        addModel(args);
        SwaggerService.getInstance().addOperationGet(args, target, propertyKey);
    };
}
