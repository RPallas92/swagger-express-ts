import { SwaggerService } from './swagger.service';
import { IApiOperationArgsBase } from './i-api-operation-args.base';
import { addModel } from './model-generator';
export interface IApiOperationPatchArgs extends IApiOperationArgsBase {}

export function ApiOperationPatch(
    args: IApiOperationPatchArgs
): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        addModel(args);
        SwaggerService.getInstance().addOperationPatch(
            args,
            target,
            propertyKey
        );
    };
}
