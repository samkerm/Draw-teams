/*
 * Copyright 2017 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: firestore/local/mutation.proto

// This CPP symbol can be defined to use imports that match up to the framework
// imports needed when using CocoaPods.
#if !defined(GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS)
 #define GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS 0
#endif

#if GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS
 #import <Protobuf/GPBProtocolBuffers.h>
#else
 #import "GPBProtocolBuffers.h"
#endif

#if GOOGLE_PROTOBUF_OBJC_VERSION < 30002
#error This file was generated by a newer version of protoc which is incompatible with your Protocol Buffer library sources.
#endif
#if 30002 < GOOGLE_PROTOBUF_OBJC_MIN_SUPPORTED_VERSION
#error This file was generated by an older version of protoc which is incompatible with your Protocol Buffer library sources.
#endif

// @@protoc_insertion_point(imports)

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

CF_EXTERN_C_BEGIN

@class GCFSWrite;
@class GPBTimestamp;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - FSTPBMutationRoot

/**
 * Exposes the extension registry for this file.
 *
 * The base class provides:
 * @code
 *   + (GPBExtensionRegistry *)extensionRegistry;
 * @endcode
 * which is a @c GPBExtensionRegistry that includes all the extensions defined by
 * this file and all files that it depends on.
 **/
@interface FSTPBMutationRoot : GPBRootObject
@end

#pragma mark - FSTPBMutationQueue

typedef GPB_ENUM(FSTPBMutationQueue_FieldNumber) {
  FSTPBMutationQueue_FieldNumber_LastAcknowledgedBatchId = 1,
  FSTPBMutationQueue_FieldNumber_LastStreamToken = 2,
};

/**
 * Each user gets a single queue of WriteBatches to apply to the server.
 * MutationQueue tracks the metadata about the queue.
 **/
@interface FSTPBMutationQueue : GPBMessage

/**
 * An identifier for the highest numbered batch that has been acknowledged by
 * the server. All WriteBatches in this queue with batch_ids less than or
 * equal to this value are considered to have been acknowledged by the
 * server.
 **/
@property(nonatomic, readwrite) int32_t lastAcknowledgedBatchId;

/**
 * A stream token that was previously sent by the server.
 *
 * See StreamingWriteRequest in datastore.proto for more details about usage.
 *
 * After sending this token, earlier tokens may not be used anymore so only a
 * single stream token is retained.
 **/
@property(nonatomic, readwrite, copy, null_resettable) NSData *lastStreamToken;

@end

#pragma mark - FSTPBWriteBatch

typedef GPB_ENUM(FSTPBWriteBatch_FieldNumber) {
  FSTPBWriteBatch_FieldNumber_BatchId = 1,
  FSTPBWriteBatch_FieldNumber_WritesArray = 2,
  FSTPBWriteBatch_FieldNumber_LocalWriteTime = 3,
};

/**
 * Message containing a batch of user-level writes intended to be sent to
 * the server in a single call. Each user-level batch gets a separate
 * WriteBatch with a new batch_id.
 **/
@interface FSTPBWriteBatch : GPBMessage

/**
 * An identifier for this batch, allocated by the mutation queue in a
 * monotonically increasing manner.
 **/
@property(nonatomic, readwrite) int32_t batchId;

/** A list of writes to apply. All writes will be applied atomically. */
@property(nonatomic, readwrite, strong, null_resettable) NSMutableArray<GCFSWrite*> *writesArray;
/** The number of items in @c writesArray without causing the array to be created. */
@property(nonatomic, readonly) NSUInteger writesArray_Count;

/** The local time at which the write batch was initiated. */
@property(nonatomic, readwrite, strong, null_resettable) GPBTimestamp *localWriteTime;
/** Test to see if @c localWriteTime has been set. */
@property(nonatomic, readwrite) BOOL hasLocalWriteTime;

@end

NS_ASSUME_NONNULL_END

CF_EXTERN_C_END

#pragma clang diagnostic pop

// @@protoc_insertion_point(global_scope)
