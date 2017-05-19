@extends('layouts.user')

{{-- Web site Title --}}
@section('title')
<?= __('Manage adverts') ?> ::
@parent
@stop

{{-- Content --}}
@section('user_area')

<div class="panel panel-default">
    <div class="panel-heading"><?= __('Your saved properties') ?></div>
    <div class="panel-body">

        <br />

        <? if($properties->total() == 0) : ?>
        <div class="row">
            <div class="col-md-12">
                <div class="blank-slate">
                    <i class="icon-exclamation icon-4x"></i>
                    <h2><?= __('You don\'t have any saved properties') ?></h2>
                    <p><?= __('To save a property to your favourites use the button on the right-hand side of the property details page.') ?></p>

                </div>
            </div>
        </div>

        <? else: ?>
        <div class="row">  
            <div class="col-lg-12" >

                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th width="525"><?= __('Property') ?></th>
                            <th><?= __('Reference') ?></th>
                            <th><? __('Options') ?></th>
                        </tr>
                    </thead>
                    <tbody>

                        <? foreach($properties as $property) : ?>
                        <tr>
                            <td>
                                <div class="row">
                                    <div class="col-lg-3">
                                        <a href="{{{ route_lang('property', array($property->id)) }}}" class="thumbnail">
                                            <img src="{{ $property->thumbnail('thumbs') }}" />
                                        </a>
                                    </div>
                                    <div class="col-lg-9">
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <a href="{{{ route_lang('property', array($property->id)) }}}"><?= $property->title ?><br /><strong><?= __('from') ?> <?= $property->priceFormatted ?></strong></a><br />
                                                <h6><?= $property->administrative_area_level_1 ?>, <?= $property->locality ?><br />
                                                    <?= __('Bedrooms') ?>: <?= $property->bedrooms; ?><br />
                                                    <?= __('Property size') ?>: <?= $property->property_size ?> <span style="">m</span><sup>2</sup></h6>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </td>
                            <td><?= str_pad($property->id, 9, '0', STR_PAD_LEFT) ?></td>
                            <td style="text-align: center">
                                <a class="btn btn-danger" href="{{{ route_lang('user/delete_favourite', array($property->id)) }}}"><?= __('Remove') ?></a>
                            </td>
                        </tr>
                        <? endforeach; ?>



                    </tbody>
                </table>
                {{ $properties->render() }}

                <br />

            </div>
        </div>
        <? endif; ?>

    </div>
    </div>

    @stop
