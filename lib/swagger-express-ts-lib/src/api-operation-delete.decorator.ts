import { SwaggerService } from './swagger.service';
import { IApiOperationArgsBase } from './i-api-operation-args.base';
import { addModel } from './model-generator';
export interface IApiOperationDeleteArgs extends IApiOperationArgsBase {}

export function ApiOperationDelete(
    args: IApiOperationDeleteArgs
): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        addModel(args);
        SwaggerService.getInstance().addOperationDelete(
            args,
            target,
            propertyKey
        );
    };
}
