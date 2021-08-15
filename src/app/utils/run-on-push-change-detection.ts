import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

/**
 * Force OnPush change detection run
 * https://github.com/angular/angular/issues/12313#issuecomment-528536934
 */
export async function runOnPushChangeDetection<T>(cf: ComponentFixture<T>) {
  const cd = cf.debugElement.injector.get<ChangeDetectorRef>(
    // tslint:disable-next-line:no-any
    ChangeDetectorRef as any
  );
  cd.detectChanges();
  await cf.whenStable();
  return;
}
